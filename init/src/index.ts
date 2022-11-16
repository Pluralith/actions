import os from 'os';
import axios from 'axios';
import path from 'path';

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as exec from '@actions/exec';

// Determine OS and arch so proper binaries can be downloaded
function GetPlatformDetails(): { os: string, arch: string } {
  let currentOS;
  let currentArch = "amd64"// = os.arch() // Currently only amd64 supported

  // Consolidate different unix-based platforms into "linux" to get correct binary
  let unixPlatforms = ['aix', 'freebsd','linux', 'openbsd', 'sunos']

  if (unixPlatforms.includes(os.platform())) currentOS = 'linux'
  else if (os.platform() === 'win32') currentOS = 'windows'
  else currentOS = 'darwin'

  return {
    os: currentOS,
    arch: currentArch
  }
}

// Get download URL and version for current OS and arch from latest CLI release on Github
async function GetLatestRelease(platform: string, arch: string): Promise<{ url: string, version: string }> {
  let releaseURL = "https://api.github.com/repos/pluralith/pluralith-cli/releases/latest"
	let releaseData = await axios.get(releaseURL)

  let tagName = releaseData.data.tag_name
  let binName = `pluralith_cli_${platform}_${arch}_${tagName}`;

  let binObject = releaseData.data.assets.find((release: any) => release.name.includes(binName))

  return {
    url: binObject.browser_download_url,
    version: tagName
  }
}

// Rename binary for addition to PATH
async function RenameReleaseBin(downloadPath: string, currentOS: string): Promise<string> {
  let targetName = currentOS === 'windows' ? 'pluralith.exe' : 'pluralith'
  let targetPath = path.join(path.dirname(downloadPath), targetName)
  
  core.info(`Rename release binary from ${downloadPath} to ${targetPath}`)

  try {
    await io.mv(downloadPath, targetPath)
    await exec.exec('chmod', ['+x', targetPath]) // Make binary executable
    return path.dirname(targetPath)
  } catch (error) {
    core.error(`Renaming release binary from ${downloadPath} to ${targetPath} failed`)
    throw error
  }
}

// Handle initialization for the CLI
async function InitializeCLI(): Promise<void> {
  let apiKey = core.getInput('api-key')
  let orgId = core.getInput('org-id') || process.env['PLURALITH_ORG_ID']
  let projectId = core.getInput('project-id') || process.env['PLURALITH_PROJECT_ID']
  let projectName = core.getInput('project-name') || process.env['PLURALITH_PROJECT_NAME']
  let terraformPath = core.getInput('terraform-path')

  let commandArguments = ['init', '--no-inputs', '--api-key', apiKey]
  // If values are present here, pass them to init command, otherwise rely on pluralith.yml
  if (orgId && projectId && projectName) {
    commandArguments = [...commandArguments, '--org-id', orgId, '--project-id', projectId, '--project-name', projectName]
  }

  let returnCode = await exec.exec('pluralith', commandArguments, { cwd: terraformPath })
  if (returnCode !== 0) {
    throw new Error(`Could not initialize Pluralith project: ${returnCode}`)
  }
}


// Main entrypoint running the entire init process
async function Init(): Promise<void> {
  try {
    core.exportVariable('PLURALITH_GITHUB_ACTION', true);

    let platform = GetPlatformDetails()
    let release = await GetLatestRelease(platform.os, platform.arch)

    core.info(`Pluralith CLI ${release.version} will be set up`);

    let binPath = await tc.downloadTool(release.url);
    binPath = await RenameReleaseBin(binPath, platform.os)

    console.log("binPath: ", binPath)
    core.addPath(binPath)
    
    await InitializeCLI()

    core.info(`Pluralith CLI ${release.version} set up and initialized`);
  } catch(error) {
    core.setFailed(error as string | Error);
  } 
}


Init()