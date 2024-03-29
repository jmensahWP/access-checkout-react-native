#!/bin/bash

invalidArgumentsMessage="Invalid arguments \n
Usage: \n
ios-find-simulator -v=<ios-version>
\n\n
<ios-version> the version of iOS for which to find a simulator\n
"

for i in "$@"
do
case $i in
    -v=*|--version=*)
    version="${i#*=}"
    shift
    ;;
    *)
    echo "Unknonwn option $i \n"
    echo $invalidArgumentsMessage
    exit 2
    # unknown option
    ;;
esac
done

filename="simulators-list"

echo "Searching for simulators"
xcrun xctrace list devices &> temp
cat temp | grep -A 100 'Simulators' > $filename

echo "Excluding following simulators: Apple TV, Apple Watch, iPod touch"
cat $filename > temp
cat temp | grep -v "Apple TV" | grep -v "Apple Watch" | grep -v "iPod touch" > $filename

echo "Found the following list of simulators"
cat $filename

if [ -z "${version}"  ]; then
  echo ""
  echo "No version has been passed, so the first simulator will be grabbed"
  simulator=$(cat $filename | grep -m 1 '\d\d\.\d')
else
  echo ""
  echo "Version ${version} has been passed, so the first simulator matching this version will be grabbed"

  # escapes the . character with a \ if it is present in the version string
  if [[ "$version" == *"."* ]]; then
    grepPattern="${version//./\.}"
  # otherwise enrich regex pattern to find a simulator that has a minor version as well
  else
    grepPattern="${version}\.\d"
  fi

  simulator=$(cat $filename | grep -m 1 "${grepPattern}")
fi

export SIMULATOR_VERSION=$(echo $simulator | grep -o '\d\d\.\d')
export SIMULATOR_ID=$(echo $simulator | grep -o -E '[0-9A-Z\-]{36}')
export SIMULATOR_NAME=$(echo $simulator | sed -e "s/ ($SIMULATOR_VERSION)//"| sed -e "s/ ($SIMULATOR_ID)//")

rm -f temp $filename

if [ -n "${SIMULATOR_ID}"  ]; then
  echo "Found following simulator:"
  echo "Name: '$SIMULATOR_NAME'"
  echo "Version: '$SIMULATOR_VERSION'"
  echo "ID: '$SIMULATOR_ID'"
else
  echo "Could not find a simulator for iOS version ${version}"
  exit 1
fi
