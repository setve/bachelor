ffprobe -loglevel error -show_format -show_streams video.mp4 -print_format json
ffprobe -loglevel error -show_format -show_streams audio.wav -print_format json
ffprobe -loglevel error -show_format -show_streams output_audio.aac -print_format json
ffprobe -loglevel error -show_format -show_streams audio-resampled.aac -print_format json


ffprobe -loglevel error -show_format -show_streams "https://s3.amazonaws.com/cbs-highlights-clips/e0cb66bc-59e3-47dc-ad23-67adaf08a9c2/e0cb66bc-59e3-47dc-ad23-67adaf08a9c2-348488.mp4" -print_format json

ffmpeg -i "https://s3.amazonaws.com/cbs-highlights-clips/e0cb66bc-59e3-47dc-ad23-67adaf08a9c2/e0cb66bc-59e3-47dc-ad23-67adaf08a9c2-348488.mp4" -vn -acodec copy audio.aac


ffmpeg -i video.mp4 -vn -acodec copy audio.wav

ffmpeg -i video.mp4 -c copy audio.aac
ffmpeg -i video2.mp4 -c: aac -ar 44100 av.aac


ffmpeg -i audio.aac -ar 41000 audio-resampled.aac
ffmpeg -i audio.aac -ar 41000 audio-resampled.aac
ffmpeg -i audio.aac -ac 2 -ab 64000 -ar 44100 audio-resampled.aac


ffmpeg -i video2.mp4 -af "volume=-7.501225162672255dB" volume.mp4
ffmpeg -i video2.mp4 -af "volume=-15dB" volume2.mp4
