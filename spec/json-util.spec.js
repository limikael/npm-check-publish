import {extractJsonObject} from "../src/json-util.js";

describe("json-util",()=>{
	it("can extract json from a doc",()=>{
		expect(extractJsonObject("{awefawef")).toEqual("{awefawef");
		expect(extractJsonObject("    {awefawef")).toEqual("{awefawef");

		expect(extractJsonObject(`
			bla bla
			test
			{
				this is the object
			}
			`
		)).toEqual(`{
				this is the object
			}`);
	});
});