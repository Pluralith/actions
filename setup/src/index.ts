import os from 'os';
import axios from 'axios';

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as exec from '@actions/exec';
import * as github from '@actions/github';

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
  let targetPath = currentOS === 'windows' ? 'pluralith.exe' : 'pluralith'
  core.info(`Rename release binary from ${downloadPath} to ${targetPath}`)

  try {
    await io.mv(downloadPath, targetPath)
    return targetPath
  } catch (error) {
    core.error(`Moving release binary from ${downloadPath} to ${targetPath} failed`)
    throw error
  }
}

// Handle authentication setup for the CLI
async function AuthenticateWithAPIKey(): Promise<void> {
  let apiKey = core.getInput('api-key')

  if (apiKey) {
    let returnCode = await exec.exec('pluralith', ['login', '--api-key', apiKey])
    if (returnCode !== 0) {
      throw new Error(`Could not authenticate Pluralith with API key: ${returnCode}`)
    }
  } else {
    throw new Error('No valid API key has been passed')
  }
}


// Main entrypoint running the entire setup process
async function Setup(): Promise<void> {
  try {
    core.exportVariable('PLURALITH_GITHUB_ACTION', true);
    
    let platform = GetPlatformDetails()
    let release = await GetLatestRelease(platform.os, platform.arch)

    core.info(`Pluralith ${release.version} will be set up`);

    let binPath = await tc.downloadTool(release.url);
    binPath = await RenameReleaseBin(binPath, platform.os)

    core.addPath(binPath)
    await AuthenticateWithAPIKey()

    core.info(`Pluralith ${release.version} set up and authenticated`);
  } catch(error) {
    core.setFailed(error as string | Error);
  } 
}


Setup()

