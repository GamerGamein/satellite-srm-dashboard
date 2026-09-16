from datasets import load_dataset
from collections import Counter
import json

ds = load_dataset('isp-uv-es/SEN2NEON', split='validation')
print('Total rows:', len(ds))

print('Superclasses:', Counter(ds['LC_superclass_text']))
print('Top detail texts:', Counter(ds['LC_detail_text']).most_common(10))

for idx in [0, 50, 200]:
    row = ds[idx]
    print({
        'id': row['id'],
        'name': row['name'],
        'lat': row['lat'],
        'lon': row['lon'],
        'crs': row['crs'],
        'land_cover': row['land_cover_detail'],
        'superclass': row['land_cover_superclass'],
        's2_date': row['s2_date'],
        'neon_date': row['neon_date'],
        'bands': row['bands'],
        'lr_dims': f"{row['lr_width']}x{row['lr_height']}",
        'hr_dims': f"{row['hr_2_5m_width']}x{row['hr_2_5m_height']}",
        'lr_path': row['lr'],
        'hr_path': row['hr_2_5m_path']
    })
