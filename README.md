# underscore-benchmark
Benchmarking stats calculation from [offen/offen](https://github.com/offen/offen) against different underscore versions.

## Default setup

To run the benchmark from this repository, you first need to install the project's dependencies. Next, you can run the setup which does the following:
- pull the underscore versions to compare and put them in the `vendor` directory
- create fixture data for the benchmark to run against

```
npm install
npm run setup
```

Once this has finished, you are ready to run the benchmark in Node.js:

```
npm test
```

You can also run the benchmark in a browser:

```
npm start
```

`budo` will start a local server at port 9966: loading this URL in a browser will run the benchmark. Results will be printed to your browser's console.

---

If used with defaults, the benchmark will use commit [c9b4b63fd08847281260205b995ae644f6f2f4d2][baseline] as the __baseline__ and [eaba5b58fa8fd788a5be1cf3b66e81f8293f70f9][comparison] as the __comparison__ for the benchmark.

[baseline]: https://github.com/jashkenas/underscore/blob/c9b4b63fd08847281260205b995ae644f6f2f4d2/underscore.js
[comparison]: https://github.com/jashkenas/underscore/blob/eaba5b58fa8fd788a5be1cf3b66e81f8293f70f9/underscore.js

## Adjusting the benchmark

### Running against a single version only

If you do not want to run the benchmark against both the __baseline__ and the __comparison__ version at the same time, you can choose to run a single test only.

Using the CLI, this is done by passing the desired test as the first command line arg:

```
npm t -- baseline
```

If you are using the browser, append the name of the desired case as the URL hash and reload the page, e.g. <http://localhost:9966/#baseline>

### Running against different versions of underscore

If you want to run this benchmark against different versions of underscore, you can use the `./pull.sh` script to pull any versions you want to compare from the [jashkenas/underscore][underscore-repo] repository.

The script expects two arguments, the __baseline__ ref and the __comparison__ ref:

```
node ./pull-versions.js master some-feature-branch
```

Such an argument can be any either a branchname or a commit hash for the repository.

[underscore-repo]: https://github.com/jashkenas/underscore

### Running against more/less user data

By default, the benchmark runs against randomly created user data for __5000 users__. This is an average real-world workload for the code under test, so it's probably a sane default. If you want to benchmark how two versions of underscore compare with more or less data being processed, you can re-run the fixture creation, passing the non-default number of users as the first argument:

```
node ./generate-fixtures.js 2500 ./fixtures/events.json
```

### Reverting your adjustments

If you want to revert your benchmark setup to the default state after making adjustments, you can use the `setup` command:

```
npm run setup
```
