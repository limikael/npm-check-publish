import path from "path";
import fs from "fs";
import {runCommand} from "./node-util.js";
import {npmGetPackageInfo, semverMax, semverIncPatch, semverSet, semverGet} from "./npm-util.js";
import semver from "semver";

export default class Package {
	constructor(dir) {
		this.dir=dir;

		let packageJsonSource=fs.readFileSync(path.join(dir,"package.json"),"utf8");
		this.packageJson=JSON.parse(packageJsonSource);

		this.name=this.packageJson.name;

		if (path.basename(dir)!=this.name)
			throw new Error("Expected dir name to match package name");
	}

	async initialize() {
		//console.log("initialize: "+this.name);
		if (!this.packageJson.private) {
			let npmResultJson=await runCommand("npm",["publish","--dry-run","--quiet","--json",this.dir])
			let npmResult=JSON.parse(npmResultJson);
			this.localHash=npmResult.shasum;

			let packageResult=await npmGetPackageInfo(this.name);
			this.publishedVersion=packageResult.version;
			this.publishedHash=packageResult.dist.shasum;
		}
	}

	async publishIfNeeded(publish) {
		for (let pkg of this.getLocalDependencies())
			await pkg.publishIfNeeded(publish);

		if (!this.needPublish())
			return;

		for (let pkg of this.getLocalDependencies()) {
			this.packageJson.dependencies[pkg.name]=
				semverSet(this.packageJson.dependencies[pkg.name],pkg.packageJson.version);
		}

		if (this.packageJson.private) {
			console.log("Private: "+this.name);
			this.savePackageJson();
			return;
		}

		if (publish)
			console.log("**** Publishing: "+this.name);

		else
			console.log("**** Updating: "+this.name);

		if (!semver.gt(this.packageJson.version,this.publishedVersion)) {
			let newVersion=semverMax(
				semverIncPatch(this.publishedVersion),
				semverIncPatch(this.packageJson.version)
			);
			console.log("   - Bumping version to: "+newVersion);
			this.packageJson.version=newVersion;
		}

		this.savePackageJson();

		if (publish) {
			await runCommand("npm",["publish",this.dir],{stdio: "inherit"});
			await this.initialize();
		}

		//console.log(this.packageJson);
	}

	savePackageJson() {
		fs.writeFileSync(
			path.join(this.dir,"package.json"),
			JSON.stringify(this.packageJson,null,2)
		);
	}

	getLocalDependencies() {
		let packages=[];
		for (let depName in this.packageJson.dependencies)
			if (this.repo.packagesByName[depName])
				packages.push(this.repo.packagesByName[depName]);

		return packages;
	}

	needPublish() {
		//console.log("local hash: "+this.localHash+" published hash: "+this.publishedHash);

		if (!this.packageJson.private &&
				this.localHash!=this.publishedHash)
			return true;

		for (let pkg of this.getLocalDependencies()) {
			if (pkg.needPublish())
				return true;

			//console.log("dep: ",this.packageJson.dependencies[pkg.name]);
			if (!semver.eq(semverGet(this.packageJson.dependencies[pkg.name]),pkg.packageJson.version))
				return true;
		}

		return false;
	}
}