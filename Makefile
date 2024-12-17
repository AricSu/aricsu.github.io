all: build

build:
	yarn docs:build
	cd ../aricsu.github.io
	git checkout public

	# cp -rf ./docs/.vitepress
	# echo "www.askaric.com">CNAME
	# yarn docs:serve
	

serve:
	python3 make_sidebar.py
	yarn docs:build 
	yarn docs:serve  --experimental-require-module

dev:
	yarn docs:dev

pre:
	brew install node
	brew install yarn
	yarn add -D vitepress