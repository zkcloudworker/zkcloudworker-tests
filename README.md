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

`clinic flame --collect-only -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"`

`clinic bubble --collect-only -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"`

`clinic heapprofiler --collect-only -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"`

`clinic heapprofiler --visualize-only .clinic/619795.clinic-heapprofiler `
`clinic bubble --visualize-only .clinic/620797.clinic-bubbleprof > tt 2>&1`
`clinic flame --visualize-only .clinic`

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

# List the o1js version
`npm list o1js`

```
zkcloudworker-tests@0.1.0 /mnt/data1/nix/time/2024/10/17/zkcloudworker-tests
├── o1js@1.8.0
└─┬ zkcloudworker@0.14.9
  └── o1js@1.8.0 deduped
  ```

# 1.9.0

mdupont@mdupont-G470:~/2024/10/17/zkcloudworker-tests$ clinic doctor -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"
To generate the report press: Ctrl + C
[11:56:35 AM] chain: local
[11:56:35 AM] Contract address: B62qrAHD6L8wSve8DbmdP8p5zTGkrHMR4SpSAgziejK4ah8CiTHA9Vx
[11:56:35 AM] Sender address: B62qj1zbvuFECH6bU7AM956oiTDBYJ3vTLNdUNDNyuZwBCzBP17AjxF
[11:56:35 AM] Sender's balance: 1000
[11:56:35 AM] RSS memory before compile: 526 MB
[11:56:35 AM] Analyzing contracts methods...
[11:56:35 AM] methods analyzed: 217.599ms
[11:56:35 AM] method's total size for a TinyContract is 326 rows (0.5% of max 65536 rows)
[11:56:35 AM] setValue rows: 326
[11:56:35 AM] method's total size for a NFTContract is 475 rows (0.72% of max 65536 rows)
[11:56:35 AM] updateMetadata rows: 475
[11:56:35 AM] method's total size for a pluginProgram is 405 rows (0.62% of max 65536 rows)
[11:56:35 AM] method's total size for a nftProgram is 41 rows (0.06% of max 65536 rows)
[11:56:35 AM] compiling...
[11:56:38 AM] compiled TinyContract: 3.158s
[11:56:38 AM] TinyContract vk hash: 8245834022738358141062259645293186701875428586778221295592071370499329370209
[12:00:29 PM] compiled NFTProgram: 3:51.423 (m:ss.mmm)
[12:00:29 PM] NFTProgram vk hash: 17888036533303739513420710182496118161782820261281582942121479875645792280045
[12:00:29 PM] compiling...
[12:00:33 PM] compiled NFTContract: 3.238s
[12:00:33 PM] NFTContract vk hash: 25627800335267682706959993299516301279306925636901235894835645899913768466118
[12:00:49 PM] compiled plugin ZkProgram: 15.823s
[12:00:49 PM] PluginProgram vk hash: 23213964885852408601263924529840149138076704109015073794469561326344424559624
[12:00:49 PM] RSS memory before deploy: 1965 MB, changed by 1439 MB
[12:00:49 PM] deployed: 199.173ms
[12:00:49 PM] RSS memory before change owner: 1967 MB, changed by 2 MB
[12:01:06 PM] change owner proof generated: 16.931s
[12:01:21 PM] change owner proof generated: 15.238s
[12:01:36 PM] change owner proof generated: 14.756s
[12:01:51 PM] change owner proof generated: 14.906s
[12:02:05 PM] change owner proof generated: 14.762s
[12:03:02 PM] prepare change owner tx: 9.022s
[12:03:03 PM] change owner tx: 5Ju6w6J1Bm1az2pMvphoKVrxzXHnCi2W3uMR85MUNugYLViBgm57
[12:03:03 PM] RSS memory after change owner: 3556 MB, changed by 1589 MB
PASS tests/sideloading.nft1.190.test.ts
  NFT with Side loading verification key
    ✓ should initialize a blockchain (381 ms)
    ✓ should analyze contracts methods (218 ms)
    ✓ should compile TinyContract (3158 ms)
    ✓ should compile nft ZkProgram (231425 ms)
    ✓ should compile NFTContract (3239 ms)
    ✓ should compile plugin ZkProgram (15823 ms)
    ✓ should deploy a SmartContract (200 ms)
    ✓ should change owner (134006 ms)
    ○ skipped should update metadata

Test Suites: 1 passed, 1 total
Tests:       1 skipped, 8 passed, 9 total
Snapshots:   0 total
Time:        389.501 s
Ran all test suites matching /tests\/sideloading.nft1.190.test.ts/i.


# 1.8.0

```
[6:17:33 PM] chain: local
[6:17:33 PM] Contract address: B62qoXT5kUwzZWKfsoQ28FKHHj98Jgm3Dc8jABQNAhVDaL65Lg3wHZu
[6:17:33 PM] Sender address: B62qqMSj6LJf5aeXd9H5L1CuG2J9ca24zgi9DnEA6rmJZ9ibfkconx8
[6:17:33 PM] Sender's balance: 1000
[6:17:33 PM] RSS memory before compile: 538 MB
[6:17:33 PM] Analyzing contracts methods...
[6:17:34 PM] methods analyzed: 329.173ms
[6:17:34 PM] method's total size for a TinyContract is 326 rows (0.5% of max 65536 rows)
[6:17:34 PM] setValue rows: 326
[6:17:34 PM] method's total size for a NFTContract is 415 rows (0.63% of max 65536 rows)
[6:17:34 PM] updateMetadata rows: 415
[6:17:34 PM] method's total size for a pluginProgram is 405 rows (0.62% of max 65536 rows)
[6:17:34 PM] method's total size for a nftProgram is 41 rows (0.06% of max 65536 rows)
[6:17:34 PM] compiling...
[6:17:36 PM] compiled TinyContract: 2.619s
[6:17:36 PM] TinyContract vk hash: 8245834022738358141062259645293186701875428586778221295592071370499329370209
[6:17:48 PM] compiled NFTProgram: 11.454s
[6:17:48 PM] NFTProgram vk hash: 17888036533303739513420710182496118161782820261281582942121479875645792280045
[6:17:48 PM] compiling...
[6:17:52 PM] compiled NFTContract: 3.840s
[6:17:52 PM] NFTContract vk hash: 26184645703214362543202895948922296290367685662201761358629574789828692929745
[6:17:53 PM] compiled plugin ZkProgram: 1.251s
[6:17:53 PM] PluginProgram vk hash: 23213964885852408601263924529840149138076704109015073794469561326344424559624
[6:17:53 PM] RSS memory before deploy: 1906 MB, changed by 1368 MB
[6:17:53 PM] deployed: 249.93ms
[6:17:53 PM] RSS memory before change owner: 1907 MB, changed by 1 MB
[6:18:13 PM] change owner proof generated: 20.297s
[6:18:31 PM] change owner proof generated: 17.275s
[6:18:49 PM] change owner proof generated: 18.542s
[6:19:07 PM] change owner proof generated: 17.595s
[6:19:25 PM] change owner proof generated: 18.531s
[6:20:30 PM] prepare change owner tx: 10.777s
[6:20:32 PM] change owner tx: 5JuLzokFEquigjgYcRgVzEiq8f1tnWXTpJFADvRNFxfejQ9Smmze
[6:20:32 PM] RSS memory after change owner: 3735 MB, changed by 1828 MB
PASS tests/sideloading.nft1.190.test.ts
  NFT with Side loading verification key
    ✓ should initialize a blockchain (1032 ms)
    ✓ should analyze contracts methods (330 ms)
    ✓ should compile TinyContract (2619 ms)
    ✓ should compile nft ZkProgram (11455 ms)
    ✓ should compile NFTContract (3840 ms)
    ✓ should compile plugin ZkProgram (1254 ms)
    ✓ should deploy a SmartContract (250 ms)
    ✓ should change owner (158737 ms)
    ○ skipped should update metadata

Test Suites: 1 passed, 1 total
Tests:       1 skipped, 8 passed, 9 total
Snapshots:   0 total
Time:        185.112 s, estimated 208 s
Ran all test suites matching /tests\/sideloading.nft1.190.test.ts/i.
Analysing data
Output file is .clinic/613699.clinic-flame

```

`clinic flame --visualize-only .clinic/613699.clinic-flame`
`clinic doctor --collect-only -- node "/home/mdupont/.local/share/pnpm/global/5/node_modules/jest/bin/jest.js" "tests/sideloading.nft1.190.test.ts"`
`clinic doctor --visualize-only .clinic/628061.clinic-doctor`


```
  gh repo set-default
  gh run download

```

```
ls
```

mdupont@mdupont-G470:~/2024/10/17/zkcloudworker-tests2$ node --help | grep prof # data/20.xgit-https---github-com-zksecu-ity-o1js-git-4c605ff3e7d010ac109cfecdd664a52f1ec4e5c6-perf.data.tar.gz/profile/isolate-0x73763e0-2383-v8.log
  --cpu-prof                  Start the V8 CPU profiler on start up,
                              and write the CPU profile to disk
                              before exit. If --cpu-prof-dir is not
                              specified, write the profile to the
  --cpu-prof-dir=...          Directory where the V8 profiles
                              generated by --cpu-prof will be placed.
                              Does not affect --prof.
  --cpu-prof-interval=...     specified sampling interval in
                              microseconds for the V8 CPU profile
                              generated with --cpu-prof. (default:
  --cpu-prof-name=...         specified file name of the V8 CPU
                              profile generated with --cpu-prof
  --heap-prof                 Start the V8 heap profiler on start up,
                              and write the heap profile to disk
                              before exit. If --heap-prof-dir is not
                              specified, write the profile to the
  --heap-prof-dir=...         Directory where the V8 heap profiles
                              generated by --heap-prof will be
  --heap-prof-interval=...    specified sampling interval in bytes
                              for the V8 heap profile generated with
                              --heap-prof. (default: 512 * 1024)
  --heap-prof-name=...        specified file name of the V8 heap
                              profile generated with --heap-prof
                              help system profilers to translate
  --prof                      Generate V8 profiler output.
  --prof-process              process V8 profiler output generated
                              using --prof
mdupont@mdupont-G470:~/2024/10/17/zkcloudworker-tests2$ 
