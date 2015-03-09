#!/usr/bin/env bash

# before push always create the build files
git push origin master --tags
git push -f origin origin/master:gh-pages