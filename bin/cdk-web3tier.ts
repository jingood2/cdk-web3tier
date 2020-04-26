#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkWeb3TierStack } from '../lib/cdk-web3tier-stack';

const app = new cdk.App();
new CdkWeb3TierStack(app, 'CdkWeb3TierStack');
