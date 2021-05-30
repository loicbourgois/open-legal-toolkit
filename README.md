# The Open Legal Toolkit

> The tölt is a four-beat lateral ambling gait mainly found in Icelandic horses.  
> Known for its explosive acceleration and speed, it is also comfortable and ground-covering.

## Quickstart
```sh
remote=git@github.com:loicbourgois/tolt.git
local=$HOME/github.com/loicbourgois/tolt
mkdir -p $local
git clone $remote $local
zshrc=$HOME/.zshrc
cp $zshrc $zshrc.save
cmd="tolt(){ r=\$(python3 $local/cli.py \$*); echo \$r; }"
echo $cmd >> $zshrc
source $zshrc
tolt help
```
