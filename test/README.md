# Tests

Please keep all the behavior tests in "test/fixtures". To add a new test file or change compiler options, add/change the corresponding property in "tests.js" in this directory. Note that the file name here and the file name in "test/fixtures" must be the same. Note that you can still `require` as usual, and use all the Mocha globals, but the test is run relative to "test/fixtures/generated".

For more helpful debugging, if any test fails, all the Babel generated files are in "test/fixtures/generated", named appropriately.
