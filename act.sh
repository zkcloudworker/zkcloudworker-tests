#!/bin/bash
act  -s GITHUB_TOKEN="$(gh auth token)" -s ACTIONS_RUNTIME_TOKEN="$(gh auth token)" --verbose
