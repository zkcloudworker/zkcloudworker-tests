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

clinic flame --collect-only -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"

clinic bubble --collect-only -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"

clinic heapprofiler --collect-only -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"

clinic heapprofiler --vizua-only -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"

#
for x in `find -type d -name \*flame\*`; do clinic flame --visualize-only $x; done


# copy the data to huggingface
we link o1js-clinic to the git repo 
git clone https://huggingface.co/datasets/introspector/o1js-clinic

cp -r .clinic/* o1js-clinic/.clinic/

add the files to git lfs
cp -r .clinic/* /home/mdupont/2024/10/14/inputs/huggingface/datasets/introspector/o1js-clinic/.clinic/

Change package.json version number:

modified   package-lock.json
@@ -11,7 +11,7 @@
         "axios": "^1.7.7",
         "js-sha256": "^0.11.0",
         "nats": "^2.28.2",
-        "o1js": "1.9.0",
+        "o1js": "1.8.0",

List the o1js version
`npm list o1js`

```
zkcloudworker-tests@0.1.0 /mnt/data1/nix/time/2024/10/17/zkcloudworker-tests
├── o1js@1.8.0
└─┬ zkcloudworker@0.14.9
  └── o1js@1.8.0 deduped
  ```
