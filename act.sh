#!/bin/bash
act  -s GITHUB_TOKEN="$(gh auth token)" ACTIONS_RUNTIME_TOKEN="$(gh auth token)"
