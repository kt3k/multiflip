.PHONY: doc doc-release

doc:
	jsduck --output=doc/dev index.js

doc-release:
	jsduck --config=.jsduck.release.json

