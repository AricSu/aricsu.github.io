all: serve

# Define paths for convenience
PUBLIC_DIR = ../aricsu.github.io
SOURCE_DIR = ../askaric/docs/.vitepress/dist
CNAME_FILE = CNAME
CNAME_CONTENT = www.askaric.com

serve:
	sh sidebar_yaml.sh
	yarn docs:build 
	yarn docs:serve  --experimental-require-module

dev:
	yarn docs:dev

pre:
	brew install jq
	brew install yq
	brew install node
	brew install yarn
	yarn add -D vitepress

pub:
	cd $(PUBLIC_DIR) && git checkout public && rm -rf * && cp -rf $(SOURCE_DIR)/* $(PUBLIC_DIR)/ && echo "www.askaric.com">CNAME
	cd $(PUBLIC_DIR) && git add .
	