#!/usr/bin/env node

import PackageRepo from "./PackageRepo.js";
import Package from "./Package.js";
import minimist from "minimist";

function usage() {
    console.log("Usage:");
    console.log();
    console.log("  npm-check-publish [options] <command>");
    console.log();
    console.log("Commands:");
    console.log();
    console.log("    status  - Print package status.");
    console.log("    update  - Perform local update of package.json.");
    console.log("    publish - Update package.json and publish.");
    console.log();
    console.log("Options:");
    console.log();
    console.log("    --path  - Paths where to look for packages, separated with :");
    console.log("              Default is env var PACKAGE_SOURCE_PATH. Required.");
    console.log();
    process.exit(1);
}

let argv=minimist(process.argv.slice(2));
let packageSourcePaths=process.env.PACKAGE_SOURCE_PATH;
if (argv.path)
	packageSourcePaths=argv.path;

if (!packageSourcePaths ||
		!argv._.length==1)
	usage();

packageSourcePaths=packageSourcePaths.split(":");

let repo=new PackageRepo({packageSourcePaths});
let pkg=repo.loadPackage(process.cwd());

await repo.initialize();

repo.printPackageInfo();

switch (argv._[0]) {
	case "update":
		await pkg.publishIfNeeded(false);
		break;

	case "publish":
		await pkg.publishIfNeeded(true);
		break;

	case "status":
	default:
		break;
}

