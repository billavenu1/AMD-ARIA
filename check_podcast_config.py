import asyncio
import os
from open_notebook.ai.models import Model
from open_notebook.podcasts.models import SpeakerProfile, EpisodeProfile

async def main():
    print("--- Models ---")
    models = await Model.get_all()
    for m in models:
        print(f"{m.name} ({m.type}): {m.id}")
    
    print("\n--- Speaker Profiles ---")
    speakers = await SpeakerProfile.get_all()
    for s in speakers:
        print(f"{s.name}: {s.voice_model}")

    print("\n--- Episode Profiles ---")
    episodes = await EpisodeProfile.get_all()
    for e in episodes:
        print(f"{e.name}: speaker_config={e.speaker_config}")

if __name__ == "__main__":
    asyncio.run(main())
