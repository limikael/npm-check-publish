import urlJoin from "url-join";
import semver from "semver";

export async function npmGetPackageInfo(packageName) {
    let u=urlJoin("https://registry.npmjs.org/",packageName,"latest");
    let pkgResponse=await fetch(u);
    if (pkgResponse.status<200 || pkgResponse>=300)
        throw new Error(await pkgResponse.text());

    let pkgResult=await pkgResponse.json();
    return pkgResult;
}

export function semverMax(a,b) {
    if (semver.gt(a,b))
        return a;

    return b;
}

export function semverIncPatch(v) {
    if (!semver.parse(v))
        throw new Error("Not semver: "+v);

    let ver=v.split(".");
    ver[2]=Number(ver[2])+1;

    return ver.join(".");
}

export function semverGet(ver) {
    let split=ver.match(/([^0-9]*)(.*)/);
    if (!semver.parse(split[2]))
        throw new Error("Not semver: "+newVer);

    return split[2];
}

export function semverSet(ver, newVer) {
    if (!semver.parse(newVer))
        throw new Error("Not semver: "+newVer);

    let split=ver.match(/([^0-9]*)(.*)/);
    return split[1]+newVer;
}