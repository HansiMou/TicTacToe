demo site: https://hansimou.github.io/multiplayer-snake/index.html

## If you’re using a Mac

If you have XCode (you don’t need to install it), run (and agree to XCode license terms):

$ sudo xcodebuild -license

Make sure you have Chrome installed on your computer.


## Install npm and NodeJS, see instructions.

Make sure you have at least these versions:


`$ npm --version`

3.3.12

`$ node --version`

v5.3.0

If your npm version is lower then the above versions, run:

`$ sudo npm cache clean -f`

`$ sudo npm install -g n`

`$ sudo n stable`

`$ sudo npm install -g npm`



(Note about sudo: you only need it if you run on a MAC/unix; do not write sudo on windows)

If your node/npm version is still lower (e.g., on windows it’s ~4), it may be fine. Continue with the instructions, and if all works, you’re good :)



## Fork this project:



## Then clone it locally:

`$ git clone https://github.com/<<YOUR_GITHUB_USERNAME>>/multiplayer-snake.git`

Go to the newly created directory, and double click on index.html to open it in the browser and play it.





## Install all the modules in package.json by running:

`$ sudo npm install`

You will see some warnings (ignore warnings, but email the group if you see errors), e.g.,

npm WARN deprecated lodash@0.9.2: lodash@<2.0.0 is no longer maintained.

Make sure the directory node_modules was created, e.g., you can try running:

`$ ./node_modules/http-server/bin/http-server`





Run:

`$ sudo ./node_modules/protractor/bin/webdriver-manager update`

That will make sure webdriver drivers are up-to-date.





Run:

`$ sudo rm -rf node_modules/@types`

(sadly TS compiler looks there, which creates errors, see this open issue)





Run:

`$ sudo npm install -g grunt-cli`

That allows you to run grunt instead of ./node_modules/grunt-cli/bin/grunt

`$ sudo npm install -g typescript`

That allows you to run tsc instead of ./node_modules/typescript/bin/tsc

Verify you have the latest version of the compiler:

`$ tsc --version`

message TS6029: Version 1.7.5



## How to refactor code

Run this command from the root (.) directory, NOT from the src directory:

`$ tsc --watch`

This will run TypeScript-Compiler (tsc) and watch for changes in your ts files.



Open index.html , make a move and see in the console your new text.

At last, run `grunt` to uglify all the files to make it smaller, then use the dist/index.min.html.


