import { Component, System, World } from "../../ecs/index";
import { TransformC, Object3DC } from "../../ecs/components";
import { applyQuery } from "../../ecs/index";
import { getComponent } from "./utils";
import { Audio, AudioListener } from "three";
import { RenderSystem } from "./RenderSystem";

interface AudioCData {
  src: string;
  audio: Audio | null;
  volume: number;
  autoplay: boolean;
  loop: boolean;
  triggerEvent: string | null;
}

export const AudioC: Component<AudioCData> = {
  type: "AudioC",
  data: {
    src: "",
    volume: 0.5,
    audio: null,
    autoplay: false,
    loop: false,
    triggerEvent: null,
  },
};

const newAudio = (
  listener: AudioListener,
  buffer: AudioBuffer,
  volume: number,
  loop: boolean = false
): Audio<GainNode> => {
  const audio = new Audio(listener);

  audio.setBuffer(buffer);
  audio.setVolume(volume);

  audio.loop = loop;

  return audio;
};

export interface AudioSystem extends System {
  world: World | null;
  muted: boolean;
  isPlaying: boolean;
  playAll: () => void;
  muteAll: () => void;
  unmuteAll: () => void;
}

export const AudioSystem: AudioSystem = {
  type: "AudioSystem",
  queries: [TransformC, Object3DC, AudioC],
  muted: false,
  isPlaying: false,
  world: null,

  init: function (world) {
    this.world = world;
    this.entities = applyQuery(world.entities, this.queries);
    const renderSystem = world.getSystem<RenderSystem>(RenderSystem.type);

    // TODO (Kirill): Looks like this fails in some cases causing app to hand for a few second on load
    // It logs: "The AudioContext was not allowed to start. It must be resumed (or created) after a user gesture on the page. https://goo.gl/7K7WLu"
    const audioListener = new AudioListener();

    renderSystem?.camera?.add(audioListener);

    this.entities.forEach((ent) => {
      const cmp = getComponent(ent, AudioC);
      const { src, volume, loop } = cmp;

      const audioBuffer = world.assets.audio.get(src);

      if (audioBuffer) {
        cmp.audio = newAudio(audioListener, audioBuffer, volume, loop);

        // Play sound triggered by custom event
        // Useful for triggering sound from another system
        if (cmp.triggerEvent) {
          window.addEventListener(cmp.triggerEvent, () => {
            const tempAudio = newAudio(
              audioListener,
              audioBuffer,
              volume,
              loop
            );
            !this.muted ? tempAudio.play() : null;
          });
        }
      } else {
        console.warn(
          `No sound data found for a given source ${src}`,
          "Check if audio file is loaded correctly."
        );
      }
    });

    this.muteAll();

    // Autoplay
    this.entities?.forEach((ent) => {
      const { audio, autoplay } = getComponent(ent, AudioC);
      if (autoplay) {
        this.isPlaying = true;
        audio?.play();
      }
    });

    window.addEventListener("play-sounds", (() => {
      this.unmuteAll();
    }) as EventListener);

    window.addEventListener("stop-sounds", (() => {
      this.muteAll();
    }) as EventListener);
  },

  playAll: function () {
    this.isPlaying = true;

    this.entities?.forEach((ent) => {
      const { audio } = getComponent(ent, AudioC);
      audio?.play();
    });
  },

  muteAll: function () {
    this.muted = true;

    this.entities?.forEach((ent) => {
      const { audio } = getComponent(ent, AudioC);
      audio?.setVolume(0);
    });
  },

  unmuteAll: function () {
    this.muted = false;

    this.entities?.forEach((ent) => {
      const { audio, volume } = getComponent(ent, AudioC);
      audio?.setVolume(volume);
    });
  },
};
