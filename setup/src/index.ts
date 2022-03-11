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

// Get download URL for current OS anc arch from latest CLI release on Github
async function GetLatestReleaseURL(platform: string, arch: string): Promise<string> {
  let releaseURL = "https://api.github.com/repos/pluralith/pluralith-cli/releases/latest"
	let releaseData = await axios.get(releaseURL)

  let tagName = releaseData.data.tag_name
  let binName = `pluralith_cli_${platform}_${arch}_${tagName}`;

  let binObject = releaseData.data.assets.find((release: any) => release.name.includes(binName))

  return binObject.browser_download_url
}

// Rename binary for addition to PATH
async function RenameReleaseBin(downloadPath: string, currentOS: string): Promise<string> {
  let targetPath = currentOS === 'windows' ? 'pluralith.exe' : 'pluralith'
  core.debug(`Rename release binary from ${downloadPath} to ${targetPath}`)

  try {
    await io.mv(downloadPath, targetPath)
    return targetPath
  } catch (error) {
    core.error(`Moving release binary from ${downloadPath} to ${targetPath} failed`)
    throw error
  }
}


// Main entrypoint running the entire setup process
async function Setup(): Promise<void> {
  try {
    let platform = GetPlatformDetails()
    let releaseURL = await GetLatestReleaseURL(platform.os, platform.arch)

    let binPath = await tc.downloadTool(releaseURL);
    binPath = await RenameReleaseBin(binPath, platform.os)

    core.addPath(binPath)
  } catch(error) {
    core.setFailed(error as string | Error);
  } 
}


Setup()

