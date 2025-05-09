export function extractJsonObject(s) {
	s=s.trim();
	if (s.startsWith("{"))
		return s;

	let m=s.match(/\n[ \t]*(\{[ \t]*\n.*)$/s);
	//console.log(m);
	if (m)
		return m[1];
}