SRC="$(dirname $0)/obj"
DEST="$(dirname $0)"
for file in $SRC/*
do
	filename=`basename "$file"`
	python convert_obj_three.py -i "$SRC/${filename%%.*}.obj" -o "$DEST/${filename%%.*}.js" -a none -s flat -t ascii -d normal
	# $(dirname $0)/ffmpeg -y -i "$file" -acodec aac -ab 112k -vcodec libx264 -profile:v high -preset slower -level 3.1 -refs 4 -b:v 1800k -bt:v 3600k -pix_fmt yuv420p -vf scale=-1:720 -threads 0 -f mp4 -strict -2 "$DEST/${filename%%.*}.mp4"
	# $(dirname $0)/ffmpeg -y -i "$file" -codec:a libvorbis -b:a 112k -codec:v libvpx -quality good -cpu-used 0 -b:v 1800k -qmin 10 -qmax 42 -maxrate 1800k -bufsize 3600k -threads 4 -vf scale=-1:720 -f webm "$DEST/${filename%%.*}.webm"
done