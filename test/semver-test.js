import {semverIncPatch,semverSet} from "../src/npm-util.js";
import semver from "semver";

//console.log(semverIncPatch("1.2.3"));
//console.log(semver.lt("^1.0.0","1.0.1"));
console.log(semverSet("^1.2.3","1.2.4"));