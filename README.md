# zkcloudworker-tests
zkCloudWorker tests


```
git clone https://github.com/zkcloudworker/zkcloudworker-tests
  cd zkcloudworker-tests/
  mv ./env.json.example ./env.json
  npm test
```

```
jest tests/sideloading.nft1.190.test.ts 
```

```
clinic doctor -- node ~/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"
```
  * install v8 via nix
  `nix-shell -p v8`

get the v8 source and we run d8 instead of nodejs to run the tick processor.
https://v8.dev/docs

I check it out here https://github.com/meta-introspector/time to /time 
```
/time/2024/09/06/v8/tools/linux-tick-processor ./isolate-0x742558001060-556690-556690-v8.log 
```
