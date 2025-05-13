import librosa
import os
import json
import sys

if sys.argv[1] == "generate":
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

elif sys.argv[1] == "double":
    data = {}
    with open(f'levels/{sys.argv[2]}/beats.json') as f:
        data = json.loads(f.read())

    a = []
    for i in range(len(data) - 1):
        a.append(data[i])
        diff = data[i+1] - data[i]
        a.append(data[i] + diff / 2)

    a.append(data[-1])
    with open(f'levels/{sys.argv[2]}/beats.json', 'w') as f:
        json.dump(a, f)
    print("doubled")
