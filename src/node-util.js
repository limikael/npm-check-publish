import {spawn} from "child_process";
import fs from "fs";

export async function runCommand(command, args=[], options={}) {
	const child=spawn(command, args, options);
	let out="";

	await new Promise((resolve,reject)=>{
		if (child.stdout) {
			child.stdout.on('data', (data) => {
				if (options.passthrough)
					process.stdout.write(data);

				out+=data;
			});
		}

		if (child.stderr) {
			child.stderr.on('data', (data) => {
				if (options.passthrough)
					process.stderr.write(data);

				else
					console.log(`stderr: ${data}`);
			});
		}

		child.on('close', (code) => {
			if (code) {
				console.log(out);
				return reject(new Error(command+" exit code: "+code))
			}

			resolve();
		});
	});

	return out;
}
