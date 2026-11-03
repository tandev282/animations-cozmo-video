import csv
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

csv_path = os.path.join(PROJECT_ROOT, 'data', 'anim_record.csv')
output_js = os.path.join(PROJECT_ROOT, 'assets', 'js', 'data.js')

# Online sources from https://github.com/cozmo4hri/animations/tree/master/animation-set
CDN_BASE = "https://cdn.jsdelivr.net/gh/cozmo4hri/animations@master/animation-set"
GITHUB_RAW_BASE = "https://raw.githubusercontent.com/cozmo4hri/animations/master/animation-set"

animations = []

with open(csv_path, 'r', encoding='utf-8') as f:
    reader = csv.reader(f)
    header = next(reader, None)
    for row in reader:
        if not row or len(row) < 4:
            continue
        try:
            anim_id = int(row[0].strip())
            name = row[1].strip()
            group = row[2].strip()
            duration = row[3].strip()
            
            video_file = f"{anim_id}.MOV.mp4"
            # IDs 1 to 348 have recorded videos in cozmo4hri/animations repository
            has_video = (1 <= anim_id <= 348)
            
            animations.append({
                "id": anim_id,
                "name": name,
                "group": group,
                "duration": duration,
                "hasVideo": has_video,
                "videoFile": video_file if has_video else None,
                "videoSrc": f"{CDN_BASE}/{video_file}" if has_video else None
            })
        except Exception as e:
            print(f"Error parsing row {row}: {e}")

with open(output_js, 'w', encoding='utf-8') as f:
    f.write("// Auto-generated dataset from anim_record.csv and GitHub animations repository\n")
    f.write("window.COZMO_ANIMATIONS = " + json.dumps(animations, indent=2, ensure_ascii=False) + ";\n")

video_count = sum(1 for a in animations if a['hasVideo'])
print(f"Successfully generated {output_js} with {len(animations)} animations ({video_count} with videos).")
