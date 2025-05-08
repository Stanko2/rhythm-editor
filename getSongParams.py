import librosa
import os
import json


for i in os.listdir('levels/'):
    data = {}
    with open(f'levels/{i}/data.json') as f:
        data = json.loads(f.read())
    song = data['song']
    y, sr = librosa.load(f'static/{song}')

    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, trim=False)
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)

    with open(f'levels/{i}/beats.json', 'w') as f:
        json.dump(beat_times.tolist(), f)

    print(f"{song}: {tempo[0]} BPM, {len(beat_times)} beats")
