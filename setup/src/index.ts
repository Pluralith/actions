import path from 'path';
import os from 'os';
import axios from 'axios';

import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';
import * as io from '@actions/io';
import * as exec from '@actions/exec';
import * as github from '@actions/github';

function GetPlatformDetails(): string[] {
  let platform;
  let arch = "amd64"// = os.arch() // Currently only amd64 supported

  let unixPlatforms = ['aix', 'freebsd','linux', 'openbsd', 'sunos']

  if (unixPlatforms.includes(os.platform())) platform = 'linux'
  else if (os.platform() === 'win32') platform = 'windows'
  else platform = 'darwin'

  return [platform, arch]
}

async function GetLatestReleaseURL(): Promise<string> {
  let [platform, arch] = GetPlatformDetails() as [string, string]

  let releaseURL = "https://api.github.com/repos/pluralith/pluralith-cli/releases/latest"
	let releaseData = await axios.get(releaseURL)

  let tagName = releaseData.data.tag_name
  let binName = `pluralith_cli_${platform}_${arch}_${tagName}`;

  let binObject = releaseData.data.assets.find((release: any) => release.name.includes(binName))

  return binObject.browser_download_url
}

GetLatestReleaseURL()

