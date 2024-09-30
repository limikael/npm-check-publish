import Package from "./Package.js";
import path from "path";
import fs from "fs";
import {Table} from "console-table-printer";
import * as readline from 'readline';
import {runInParallel} from "./js-util.js";

export default class PackageRepo {
	constructor({packageSourcePaths}) {
		this.packageSourcePaths=packageSourcePaths;
		this.packages=[];
		this.packagesByName={};
		this.packagePaths={};

		for (let packageSourcePath of packageSourcePaths) {
			let dirs=fs.readdirSync(packageSourcePath);
			for (let dir of dirs)
				this.packagePaths[dir]=path.join(packageSourcePath,dir);
		}

		//console.log(this.packagePaths);
	}

	loadPackage(pkgPath) {
		let pkg=new Package(pkgPath);

		pkg.repo=this;
		this.packages.push(pkg);
		this.packagesByName[pkg.name]=pkg;

		this.walkDeps(pkg);

		return pkg;
	}

	walkDeps(pkg) {
		for (let depName in pkg.packageJson.dependencies)
			if (this.packagePaths[depName] && !this.packagesByName[depName])
				this.loadPackage(this.packagePaths[depName]);
	}

	async initialize() {
		console.log("initialize..");

		let jobs=[];
		for (let pkg of this.packages) {
			jobs.push(async ()=>{
				await pkg.initialize();
			});
		}

		await runInParallel(jobs,10,percent=>{
			process.stdout.write("Checking packages: "+percent+"%\r");
		});

		/*for (let i=0; i<this.packages.length; i++) {
			jobs
			process.stdout.write("Checking packages: "+(i+1)+"/"+this.packages.length+"\r");
			await this.packages[i].initialize();
		}*/

		readline.clearLine(process.stdout);
	}

	printPackageInfo() {
		let t=new Table({
			columns: [
				{name: "package", alignment: "left" },
				{name: "local", alignment: "left" },
				{name: "published", alignment: "left" },
				{name: "publish", alignment: "left" },
			]
		});

		let infoTable=[];
		for (let pkg of this.packages)
			t.addRow({
				package: pkg.name,
				local: pkg.packageJson.version,
				published: pkg.publishedVersion,
				publish: pkg.needPublish()
			})

		t.printTable();
	}
}