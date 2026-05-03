import asyncio
import os
from open_notebook.ai.models import Model
from open_notebook.podcasts.models import SpeakerProfile, EpisodeProfile

async def main():
    # 1. Add the Gemini TTS model
    tts_model = Model(
        name="gemini-3.1-flash-tts-preview",
        provider="google",
        type="text_to_speech"
    )
    await tts_model.save()
    print(f"Added model: {tts_model.name} ({tts_model.id})")

    # 2. Update Speaker Profile
    speaker = await SpeakerProfile.get_by_name("tech_experts")
    if speaker:
        speaker.voice_model = str(tts_model.id)
        await speaker.save()
        print(f"Updated speaker profile 'tech_experts' with voice model {tts_model.id}")
    else:
        # Create it if it doesn't exist (though it should based on check_podcast_config.py)
        speaker = SpeakerProfile(
            name="tech_experts",
            description="Technical experts discussing complex topics",
            voice_model=str(tts_model.id),
            speakers=[
                {"name": "Alex", "voice_id": "Zephyr", "backstory": "AI Researcher", "personality": "Analytical"},
                {"name": "Jordan", "voice_id": "Zephyr", "backstory": "Software Engineer", "personality": "Practical"}
            ]
        )
        await speaker.save()
        print(f"Created speaker profile 'tech_experts'")

    # 3. Ensure Episode Profile exists
    episode = await EpisodeProfile.get_by_name("tech_discussion")
    if episode:
        episode.speaker_config = "tech_experts"
        # We also need outline and transcript models (Gemini Flash is good for this)
        # Find a language model
        models = await Model.get_all()
        flash_model = next((m for m in models if "flash" in m.name and m.type == "language"), models[0])
        
        episode.outline_llm = str(flash_model.id)
        episode.transcript_llm = str(flash_model.id)
        await episode.save()
        print(f"Updated episode profile 'tech_discussion' with models")
    else:
        print("Episode profile 'tech_discussion' not found")

if __name__ == "__main__":
    asyncio.run(main())
