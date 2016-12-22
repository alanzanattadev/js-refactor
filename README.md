# js-refactor

Some scripts and codemods to quickly reorganize your javascript.

## Install

```sudo yarn global add alanzanattadev/js-refactor```
or
```sudo npm install -g alanzanattadev/js-refactor```

## move-js-file

Easily move a js file (.js, .native.js, .web.js ...) without rewriting manually every imports.
You'll be able to refactor modules that use your modified module as well.

IT DOESN'T MOVE YOUR FILE, ONLY REWRITE IMPORTS, but it displays a possible command to run to move your file. It's done like that because it depends on VCS you use.

- cd into your js module
- ```move-file-js [relative path to the file to move] [relative path to the new location] [current module name] [paths to modules using this one]```
eg:
```
for this architecture :
.
├── app
│   └── lib
│       ├── a.js
│       └── b.js
└── commons
    └── lib
        ├── actions
        │   ├── b.js
        │   └── c.native.js
        ├── actionsv2
        │   └── a.js
        └── components
            ├── a.js
            ├── b.js
            └── presenters
                └── c.js
```
- ```cd commons```
- ```move-file-js ./lib/actions/a.js ./lib/actionsv2/ mycommons ../app/```


```
alan@xps-9550 ~/Documents/dirt/jscodeshift-test/commons $ ~/Documents/veyo/js-refactor/shift.sh ./lib/actions/a.js ./lib/actionsv2/ mycommons ../app/
Password:
Processing 6 files...
Spawning 6 workers...
Sending 1 files to free worker...
Sending 1 files to free worker...
Sending 1 files to free worker...
Sending 1 files to free worker...
Sending 1 files to free worker...
Sending 1 files to free worker...

          =================================================
          Import changed in lib/components/b.js
            ../actions/a.js -> ./lib/actionsv2/a
            ----
            < -> import {Bite} from '../actions/a.js'
            > => import { Bite } from "../actionsv2/a";
            ----
            targetSourcePath: ../actions/a
            oldSourcePathWithoutExt: ../actions/a
            newSourcePath: ./lib/actionsv2/a
          =================================================


          =================================================
          Import not changed in lib/components/b.js
            ../actions/b.js
            ----
            < -> import {Haha} from '../actions/b.js';
            ----
            targetSourcePath: ../actions/a
            oldSourcePathWithoutExt: ../actions/b
          =================================================


          =================================================
          Import changed in lib/components/a.js
            ../actions/a -> ./lib/actionsv2/a
            ----
            < -> import {Ok} from '../actions/a';
            > => import { Ok } from "../actionsv2/a";
            ----
            targetSourcePath: ../actions/a
            oldSourcePathWithoutExt: ../actions/a
            newSourcePath: ./lib/actionsv2/a
          =================================================


          =================================================
          Import not changed in lib/components/presenters/c.js
            ../../actions/c
            ----
            < -> import haha from '../../actions/c';
            ----
            targetSourcePath: ../../actions/a
            oldSourcePathWithoutExt: ../../actions/c
          =================================================

All done.
Results:
0 errors
1 unmodified
3 skipped
2 ok
Time elapsed: 1.168seconds
Processing 2 files...
Spawning 2 workers...
Sending 1 files to free worker...
Sending 1 files to free worker...

          =================================================
          Import not changed in ../app/lib/b.js
            mycommons/lib/actions/c
            ----
            < -> import haha from 'mycommons/lib/actions/c';
            ----
            targetSourcePath: mycommons/lib/actions/a
            oldSourcePathWithoutExt: mycommons/lib/actions/c
          =================================================


          =================================================
          Import changed in ../app/lib/a.js
            mycommons/lib/actions/a -> ./lib/actionsv2/a
            ----
            < -> import {Haha} from 'mycommons/lib/actions/a';
            > => import { Haha } from "mycommons/lib/actionsv2/a";
            ----
            targetSourcePath: mycommons/lib/actions/a
            oldSourcePathWithoutExt: mycommons/lib/actions/a
            newSourcePath: ./lib/actionsv2/a
          =================================================

All done.
Results:
0 errors
1 unmodified
0 skipped
1 ok
Time elapsed: 0.723seconds
git mv ./lib/actions/a.js ./lib/actionsv2/
```
