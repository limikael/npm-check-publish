export class ResolvablePromise extends Promise {
	constructor(cb = () => {}) {
        let resolveClosure = null;
        let rejectClosure = null;

		super((resolve,reject)=>{
            resolveClosure = resolve;
            rejectClosure = reject;

			return cb(resolve, reject);
		});

        this.resolveClosure = resolveClosure;
        this.rejectClosure = rejectClosure;
 	}

	resolve=(result)=>{
		this.resolveClosure(result);
	}

	reject=(reason)=>{
		this.rejectClosure(reason);
	}
}

export async function runInParallel(processes, concurrencyLimit, onProgress) {
	class CountSemaphore extends EventTarget {
		constructor(limit) {
			super();
			this.busy=0;
			this.limit=limit;
		}

		release() {
			this.busy--;
			this.dispatchEvent(new Event("change"));
		}

		aquire() {
			if (this.busy<this.limit) {
				this.busy++;
				return Promise.resolve();
			}

			let promise=new ResolvablePromise();
			function listener() {
				if (this.busy<this.limit) {
					this.busy++;
					this.removeEventListener("change",listener);
					promise.resolve();
				}
			}

			this.addEventListener("change",listener);
			return promise;
		}
	}

	let all=[];
	let numComplete=0;
	let countSemaphore=new CountSemaphore(concurrencyLimit);

	for (let proc of processes) {
		await countSemaphore.aquire();
		let promise=proc();
		all.push(promise);

		promise.then(()=>{
			countSemaphore.release();
			numComplete++;
			if (onProgress)
				onProgress(Math.round(100*(numComplete/processes.length)));
		});
	}

	return Promise.all(all);
}