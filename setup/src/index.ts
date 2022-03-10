import path from 'path';
import os from 'os';
import axios from 'axios';

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as exec from '@actions/exec';
import * as github from '@actions/github';

function GetPlatformDetails(): { os: string, arch: string } {
  let currentOS;
  let currentArch = "amd64"// = os.arch() // Currently only amd64 supported

  let unixPlatforms = ['aix', 'freebsd','linux', 'openbsd', 'sunos']

  if (unixPlatforms.includes(os.platform())) currentOS = 'linux'
  else if (os.platform() === 'win32') currentOS = 'windows'
  else currentOS = 'darwin'

  return {
    os: currentOS,
    arch: currentArch
  }
}

async function GetLatestReleaseURL(platform: string, arch: string): Promise<string> {
  let releaseURL = "https://api.github.com/repos/pluralith/pluralith-cli/releases/latest"
	let releaseData = await axios.get(releaseURL)

  let tagName = releaseData.data.tag_name
  let binName = `pluralith_cli_${platform}_${arch}_${tagName}`;

  let binObject = releaseData.data.assets.find((release: any) => release.name.includes(binName))

  return binObject.browser_download_url
}

async function MoveReleaseBin(downloadPath: string) {
  let targetPath = '/usr/local/bin/pluralith'
  core.debug(`Move release binary from ${downloadPath} to ${targetPath}`)

  try {
    await io.mv(downloadPath, targetPath)
  } catch (error) {
    core.error(`Moving release binary from ${downloadPath} to ${targetPath} failed`)
    throw error
  }
}


async function Setup() {
  let platform = GetPlatformDetails()
  let releaseURL = await GetLatestReleaseURL(platform.os, platform.arch)

  let binPath = await tc.downloadTool(releaseURL);
  
  if (platform.os !== 'windows') await MoveReleaseBin(binPath)
}


Setup()

