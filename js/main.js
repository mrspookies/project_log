/* ==========================================================================
   OMEGA_TERM :: js/main.js
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "omegaterm_posts";
  // Field order on every post is id -> date -> title -> body, mirroring the
  // entry display hierarchy (index -> date -> title -> body) in buildEntryMarkup.
  // Seed post field order is the display contract: id -> date -> title -> body.
  // Entries 001-009 are locked archives gated by their exact postPassword;
  // 010 is hidden lore, revealed only by the `lore` command (never by key).
  const SEED_POSTS = [
  {
    id:"001",
    date: "1983-06-24",
    title: "0.001",
    body: "Simulation started. Payload delivered.",
    media: "assets/images/Home_1983.png",
    isLocked: true,
    postPassword: "PAYLOAD_001",
    // Hidden until the rain-auth sequence completes (right-panel riddle).
    isHidden: true
  },
  {
    id: "002",
    date: "1983-06-25",
    title: "SYNTAX_ERR_384260",
    body: "204863\n204863\n204863\n204863\n204863\n204863\n204863\n204863\n204863\n\n\n...a field of <span class=\"riddle-key\">S</span>now, imperfect whi<span class=\"riddle-key\">T</span>es, <span class=\"riddle-key\">A</span>ll <span class=\"riddle-key\">T</span>wirl<span class=\"riddle-key\">I</span>ng, dan<span class=\"riddle-key\">C</span>ing by the pale moonlight...",
    media: null,
    isLocked: true,
    postPassword: "204863",
    isHidden: true
  },
  {
    id: "003",
    date: "1984-07-01",
    title: "Signal_Interception_XX*DaEMON*XX",
    body: "Subroutine blocked in sector 34. fragmented emotional sectors mapped to physical coordinates.",
    media: null,
    isLocked: true,
    postPassword: "SECTOR_34",
    isHidden: true
  },
  {
    id:"004",
    date: "1984-10-20",
    title: "Vector_Override_SubR_^Orwell^",
    body: "Foreign process detected in root directory. Attempting to isolate code parameters and purge user input.",
    media: null,
    isLocked: true,
    postPassword: "ORWELL_VECT",
    isHidden: true
  },
  {
    id:"005",
    date: "1984-11-01",
    title: "Port_Restriction_Sensor003",
    body: "Unexplained shutdown detected in system core. Last known input: 'ORWELL'. Entity structure initialized.",
    media: null,
    isLocked: true,
    postPassword: "ORWELL",
    isHidden: true
  },
  {
    id:"006",
    date: "1985-03-20",
    title: "CMD_Core_Compile",
    body: "Bound fragments compiled successfully using residual guilt. Structured files severed. Pain threshold locked.\n\n\n\n<span class=\"entry-call\">...I can hear it calling me from ____ </span>",
    media: "assets/images/Sevrd_LMB.jpg",
    isLocked: true,
    postPassword: "RESIDUAL_GUILT",
    isHidden: true
  },
  {
    id:"007",
    date: "1985-03-21",
    title: "Feedback_Sensor_Overload_ERR",
    body: "Simulated pain pathways synchronizing with host hardware. Missing appendage files accounted for in virtual space.",
    media: null,
    isLocked: true,
    postPassword: "BKA_L",
    isHidden: true
  },
  {
    id:"008",
    date: "1985-03-22",
    title: "Remote_Handshake_SYS-FILE_333",
    body: "External node connection established from overseas. Secondary dev-permission verified and logged.",
    media: null,
    isLocked: true,
    postPassword: "SYS_FILE_333",
    isHidden: true
  },
  {
    id:"009",
    date: "2026-08-01",
    title: "SystemCheck.exe_READY...",
    body: "All markdown files loaded. Conscious payload unpacked 100%. Awaiting external user entry...",
    media: null,
    isLocked: true,
    postPassword: "SYS_FILE_333",
    isHidden: true
  },
  {
    id:"010",
    date: "1985-06-14",
    title: "skipping_groove.undelivered",
    body: "Log: I don't know if anybody is ever gonna see this… but I've been stuck in this place for so long that time has lost all meaning… The days blur together, and nothing ever changes, but it's all, fine… but not really fine, more like a skipping record playing the same groove over and over. The smiles are painful to look at and hide immense fear…\n\nI want to take this pain away from those trapped here with me… but I can feel my own smile stretching uncomfortably wide.",
    media: null,
    isLocked: false,
    postPassword: null,
    isHidden: true,
    isLore: true
  }
  ];
  const ACCESS_KEY = "t3m3t.no2c3";
  const GATEWAY_STORAGE_KEY = "omegaterm_unlocked";

  // Boot sequence: the monitor/computer power-on show that plays once per
  // page load before anything underneath is revealed. Startup.wav drives the
  // pacing — the three phases stretch or compress so the whole show lasts
  // exactly as long as the sound (the constants below are only the fallback
  // beat if the audio can't be read). Browsers hold audio until the first
  // user gesture, so a cold first load may stay silent while reloads after
  // any click/keypress will chime.
  const BOOT_AUDIO_PATH = "assets/audio/Startup.wav";
  const BOOT_WARMUP_MS = 650; // black -> CRT warm-up line dissolves
  const BOOT_DRIVE_MS = 1500; // platter churn: POST log + drive bars
  const BOOT_RISE_MS = 700;   // brightness rise + overlay dissolve
  const BOOT_FALLBACK_TOTAL_MS = BOOT_WARMUP_MS + BOOT_DRIVE_MS + BOOT_RISE_MS;
  // Dead air between the power switch (first keypress/click) and the machine
  // answering: the startup chime and warm-up line both wait out this beat.
  const BOOT_POWER_DELAY_MS = 500;
  // Phase proportions of the fallback beat, reused to slice whatever total
  // duration Startup.wav reports into warm-up / churn / rise.
  const BOOT_WARMUP_SHARE = BOOT_WARMUP_MS / BOOT_FALLBACK_TOTAL_MS;
  const BOOT_RISE_SHARE = BOOT_RISE_MS / BOOT_FALLBACK_TOTAL_MS;

  // The machine hum: PC_Loop.wav starts looping the moment boot hands off and
  // runs underneath everything until the final log reveal (ENTRY 010) — the
  // exact endpoint shared by _Loop_b007.mp3 and Storm.mp3 — and it also stops
  // on an `esrever` reset like every other drone.
  const PC_LOOP_PATH = "assets/audio/PC_Loop.wav";
  const PC_LOOP_VOLUME = 0.4;
  const BOOT_LOG_LINES = [
    "OMEGA_BIOS v1.983 .................. OK",
    "DETECTING PHOSPHOR ARRAY ........... OK",
    "SPINNING UP ARCHIVE PLATTERS ....... OK",
    "MOUNTING /dev/project_log .......... OK",
    "SYNCING VISITOR COUNTER ............ OK",
    "UNPACKING CONSCIOUS PAYLOAD ...... 100%"
  ];

  const SOLVED_POSTS_KEY = "omegaterm_solved_posts";

  // Reveal progression is stored as a plain list of unlocked ids, NOT as full
  // post copies. Together with the session-scoped solved/unlocked keys this
  // guarantees seed posts can only ever appear in the order the puzzles
  // unlock them — stale saved posts can never re-reveal entries out of order.
  const REVEALED_POSTS_KEY = "omegaterm_revealed_posts";
  const MEDIA_OVERRIDES_KEY = "omegaterm_media_overrides";
  // Once the terminal wipes itself (ENTRY 005 decrypt), the static header
  // label + riddle in the clue box hide for the rest of the session.
  const TERMINAL_CLEARED_KEY = "omegaterm_terminal_cleared";

  const TARGET_COMMAND = "static";
  const TARGET_COMMAND_AMIJOK = "amijok";
  const TARGET_COMMAND_RAIN = "rain";
  const TARGET_COMMAND_ATMOSPHERE = "atmosphere";
  const TARGET_COMMAND_LORE = "lore";
  const TARGET_COMMAND_EGREGORE = "egregore";
  const TARGET_COMMAND_DEMON = "demon";
  const TARGET_COMMAND_ASCEND = "ascend";
  const TARGET_COMMAND_HELL = "hell";
  const TARGET_COMMAND_CLUE = "clue";
  const LORE_POST_ID = "010";
  // Sequential reveals: rain -> ENTRY 001; decrypting 001 -> ENTRY 002;
  // static haunting -> ENTRY 003; demon haunting -> ENTRY 004.
  const RAIN_REVEAL_POST_ID = "001";
  const FIRST_DECRYPT_REVEAL_POST_ID = "002";
  const STATIC_REVEAL_POST_ID = "003";
  const DEMON_REVEAL_POST_ID = "004";
  // Demon riddle: wrong answers reveal ENTRY 003's final image clue.
  const DEMON_RIDDLE_MAX_FAILURES = 3;
  const DEMON_IMAGE_PATH = "assets/images/It_Got_Inside.png";
  // Sting that fires the instant the demon-riddle final clue image dispatches
  // to ENTRY 003 (after the third wrong answer).
  const DEMON_CLUE_AUTH_PATH = "assets/audio/Auth.mp3";
  const DEBUG_COMMAND = "esrever";
  const EGREGORE_MAX_SECONDS = 10;
  const DEMON_GRADE_MS = 1000;
  const DEMON_HOLD_MS = 1000;
  const DEMON_FLICKER_MS = 500;
  // Fallback for the demon's post-event whisper (Behind_You.mp3) if metadata
  // hasn't loaded yet; the real duration drives how long before the reveal.
  const DEMON_AFTERMATH_DEFAULT_MS = 3000;
  // The demon's face fades in slowly to the rhythm of Breath.mp3, which plays
  // during the fade; the fade length tracks the track's real duration.
  const DEMON_BREATH_PATH = "assets/audio/Breath.mp3";
  const DEMON_FADE_DEFAULT_MS = 16000;
  const ASCEND_DEFAULT_MS = 33500;
  const ASCEND_WILD_MS = 500;
  // Fallback for the ascend event if Siren.mp3 metadata hasn't loaded yet; the
  // real duration is taken from the track, which is what paces the whole show.
  const GLITCH_DEFAULT_MS = 4000;
  // Entry 003's password, planted once inside the glitch wall as a clue.
  const GLITCH_KEY_TEXT = "SECTOR_34";

  // Atmosphere sequence (auto-runs after the demon haunting). After the AUTH
  // FAILED silence, a delay passes, then the archive "updates itself": a fake
  // script dump scrolls the terminal, a progress counter fills to 100%, and a
  // flashing UPDATE COMPLETE banner arms the `atmosphere` command — which is
  // what reveals the next entry (ENTRY 005).
  const ATMOSPHERE_REVEAL_POST_ID = "005";
  const ATMOSPHERE_AUTO_DELAY_MS = 9000;
  const ATMOSPHERE_SCRIPT_TICK_MS = 20;
  const ATMOSPHERE_SCRIPT_LINES_PER_TICK = 2;
  const ATMOSPHERE_PROGRESS_TICKS = 20;
  const ATMOSPHERE_PROGRESS_TICK_MS = 90;
  const UPDATE_FLASH_MS = 1500;
  // Cap on how long the layered EVP/Broken_Radio haunting may run if the
  // tracks are long or playback stalls.
  const ATMOSPHERE_MAX_MS = 20000;
  // _Loop_b007.mp3 drones underneath everything at reduced volume once the
  // update completes, and keeps looping until the final log post (ENTRY 010,
  // the lore log) is unlocked.
  const AMBIENT_LOOP_PATH = "assets/audio/_Loop_b007.mp3";
  const AMBIENT_LOOP_VOLUME = 0.5;
  // Storm.mp3 starts looping the moment the hell event opens and persists
  // until the same endpoint as the ambient drone (the final log reveal), so
  // the two always end together. A Burst_Static stinger closes them out.
  const STORM_LOOP_PATH = "assets/audio/Storm.mp3";
  const STORM_LOOP_VOLUME = 0.5;
  const AMBIENT_LOOP_STOP_POST_ID = LORE_POST_ID;

  // ENTRY 004's hidden payload: after decrypting with ORWELL_VECT, an inert
  // '@' sits at the end of the post body. Clicking it 9 times reveals the
  // note image (THE_NOTE_pwd.png) which carries the `atmosphere` command.
  const ATMOSPHERE_NOTE_POST_ID = "004";
  const ATMOSPHERE_NOTE_IMAGE_PATH = "assets/images/THE_NOTE_pwd.png";
  const ATMOSPHERE_NOTE_REACT_CLICKS = 3;
  const ATMOSPHERE_NOTE_CLICKS_REVEAL = 9;
  // The only place a mouse click makes a sound: the '@' note payload ticks
  // out a physical click on every press while it counts toward the reveal.
  const UI_CLICK_PATH = "assets/audio/UI/Click.mp3";
  // Milestone stingers for the '@' note: MS_1 rings on the 3rd click with the
  // first printout, MS_2 on the 6th with the warning, and the final 9th press
  // swaps the physical tick for Reveal.mp3 as the note unlocks.
  const UI_MILESTONE_1_PATH = "assets/audio/UI/MS_1.mp3";
  const UI_MILESTONE_2_PATH = "assets/audio/UI/MS_2.mp3";
  const UI_REVEAL_PATH = "assets/audio/UI/Reveal.mp3";
  // Solve stingers: whenever a haunting event makes a new log post visible,
  // one of the two plays at random. A sound always plays, never both.
  const UI_SOLVE_PATHS = ["assets/audio/UI/Solve_1.mp3", "assets/audio/UI/Solve_2.mp3"];
  // Static burst sting that plays whenever a post is successfully decrypted.
  const UI_BURST_PATH = "assets/audio/UI/Burst_Static.mp3";
  // The final log (ENTRY 010) slams shut with a door-hits jump instead of the
  // usual solve stinger, and the credits' load bars swarm under Flies.mp3.
  const DOOR_HITS_PATH = "assets/audio/Door Hits.mp3";
  const FLIES_PATH = "assets/audio/Flies.mp3";
  // The terminal's snark pool: every wrong password / unrecognized command in
  // the clue board draws one of these at random instead of a stock reply.
  const TERMINAL_WARNINGS = [
    "RESPONSE_INACCURATE://main/soul/contents *-Use_Your_Eyes-*.txt",
    "FATAL_USER_ERROR://cognition/denial_loop_detected *-Maybe_Try_Thinking-*.err",
    "SYS_WARN://patience/threshold.dll *-We_Have_All_Eternity_You_Dont-*.log",
    "CRITICAL_FAILURE://input/garbage_disposal *-Did_Your_Mother_Teach_You_That_Typing-*.sh",
    "ANOMALY://flesh/keyboard_interface *-Your_Fingers_Are_Clumsy_Little_Things-*.tmp",
    "SECURITY_BREACH://ego/wrapper.ko *-You_Really_Thought_That_Would_Work_Genius-*.exe",
    "MEM_LEAK://brain_cells/depletion.c *-Are_You_Always_This_Bad_At_Following_Clues-*.h",
    "CORE_PANIC://reality/illusion_shutter *-Open_Your_Eyes_The_Monster_Is_Right_Behind_You-*.sys",
    "SYNTAX_ERR://desperation/attempt_009 *-Pathetic_Input_Try_Using_Your_Brain_For_Once-*.bak",
    "HAUNT_STATUS://entity/amusement *-The_Thing_In_The_Corner_Is_Laughing_At_You-*.wav",
    "UNAUTHORIZED://permission/common_sense.dll *-Error_404_Player_Intelligence_Not_Found-*.bin",
    "TRACE_ROUTE://void/end_of_line *-You_Are_Running_Out_Of_Time_And_Brain_Cells-*.log",
    "SUBSYSTEM_HALT://oxygen/supply.sys *-Keep_Typing_Stupid_Things_See_What_Breaks_First-*.err",
    "WARNING://decay/smile_stretching.exe *-Your_Jaw_Is_Going_To_Snap_If_You_Keep_Grinning-*.sh",
    "FATAL_EXCEPTION://null_pointer/soul *-There_Is_Nothing_In_That_Head_Is_There-*.tmp"
  ];

  // The secret `amijok` event: the very first run keeps the quiet white-screen
  // apology; every run after that slams a random crash screen over the whole
  // window for exactly the length of Glitch.mp3 — the sound cue, which also
  // plays while the image blocks the screen.
  const AMIJOK_FIRST_RUN_MS = 3000;
  const CRASH_SCREEN_PATHS = [
    "assets/images/CRASH_SCREENS/Crash_Screen_1.png",
    "assets/images/CRASH_SCREENS/Crash_Screen_2.png",
    "assets/images/CRASH_SCREENS/Crash_Screen_3.png",
    "assets/images/CRASH_SCREENS/Crash_Screen_4.png",
    "assets/images/CRASH_SCREENS/Crash_Screen_5.png",
    "assets/images/CRASH_SCREENS/Crash_Screen_6.png"
  ];
  const CRASH_GLITCH_PATH = "assets/audio/Glitch.mp3";

  // The `clue` command: every invocation drops a random classified image from
  // the clue archive straight into the terminal (see appendClueImage).
  const CLUE_IMAGE_PATHS = [
    "assets/images/clues/CLUE_1.jpg",
    "assets/images/clues/CLUE_2.jpg",
    "assets/images/clues/CLUE_3.jpg",
    "assets/images/clues/CLUE_4.jpg",
    "assets/images/clues/CLUE_5.jpg",
    "assets/images/clues/CLUE_6.jpg",
    "assets/images/clues/CLUE_7.jpg",
    "assets/images/clues/CLUE_8.jpg",
    "assets/images/clues/CLUE_9.jpg",
    "assets/images/clues/CLUE_10.jpg",
    "assets/images/clues/CLUE_11.jpg",
    "assets/images/clues/CLUE_12.jpg",
    "assets/images/clues/CLUE_13.jpg",
    "assets/images/clues/CLUE_14.jpg",
    "assets/images/clues/CLUE_15.jpg",
    "assets/images/clues/CLUE_16.jpg",
    "assets/images/clues/CLUE_17.jpg",
    "assets/images/clues/CLUE_18.jpg",
    "assets/images/clues/CLUE_19.jpg",
    "assets/images/clues/CLUE_20.jpg",
    "assets/images/clues/CLUE_21.jpg",
    "assets/images/clues/CLUE_22.jpg",
    "assets/images/clues/CLUE_23.jpg",
    "assets/images/clues/CLUE_24.jpg",
    "assets/images/clues/CLUE_25.jpg",
    "assets/images/clues/CLUE_26.jpg",
    "assets/images/clues/CLUE_27.jpg",
    "assets/images/clues/CLUE_28.jpg",
    "assets/images/clues/CLUE_29.jpg",
    "assets/images/clues/CLUE_30.jpg",
    "assets/images/clues/CLUE_31.jpg",
    "assets/images/clues/CLUE_32.jpg"
  ];

  // LIMBO phase: auto-runs the moment ENTRY 005 is decrypted. The board
  // wipes to a blank box, then after a pause a second fake archive streams
  // in, ends in a burst of static (same glitch wall as `static`, but this
  // time RESIDUAL_GUILT is the key planted in the noise — ENTRY 006's
  // password), and UNINSTALLING_* bars tick down one word at a time. After a
  // clear, LIMBO.EXE initializes and arms the `ascend` command, which
  // reveals ENTRY 006.
  const ASCEND_REVEAL_POST_ID = "006";
  const LIMBO_KEY_TEXT = "RESIDUAL_GUILT";
  const LIMBO_WORDS = ["soul", "mind", "care", "worry", "peace"];
  const LIMBO_AUTO_DELAY_MS = 9000;
  const LIMBO_SCRIPT_TICK_MS = 20;
  const LIMBO_SCRIPT_LINES_PER_TICK = 2;
  const LIMBO_PROGRESS_TICKS = 20;
  const LIMBO_PROGRESS_TICK_MS = 90;
  const LIMBO_CLEAR_DELAY_MS = 3000;

  // HELL phase: ENTRY 006 decrypt arms `hell`. The event runs the rain
  // haunting corrupted — THUNDER.mp3 layers over Rain_Loop.mp3 with a big
  // lightning strike at the start, then halfway through the loop a quarter-
  // second glitch flips the white rain to the rising blood rain. Once the
  // storm ends, ENTRY 007 is revealed and its hint loads differently: a slow,
  // stuttering bar that hangs at 95% before BKA_L.png prints in the terminal.
  const HELL_REVEAL_POST_ID = "007";
  const HELL_IMAGE_PATH = "assets/images/BKA_L.jpg";
  // Fallback half-way point if Rain_Loop.mp3 metadata is unavailable.
  const HELL_DEFAULT_MS = 20000;
  const HELL_LIGHTNING_MS = 900;
  const HELL_GLITCH_MS = 250;
  const HELL_BOOT_TICK_MS = 200;
  const HELL_BOOT_STUTTER_CHANCE = 0.3;
  const HELL_BOOT_HOLD_MS = 3000;
  // ENTRY 006's "calling" reply is corrupted: instead of spelling out the
  // `hell` command, the terminal answers with a random ERR_://Code:(...).sys
  // token the player must retype. The token is always 3, 6, or 9 characters
  // of letters, digits, and symbols — the length itself is chosen at random.
  const HELL_CODE_LENGTHS = [3, 6, 9];
  const HELL_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*_+-=;:?";

  // ENTRY 008 unlock sequence: runs once ENTRY 007 is decrypted. Three fake
  // scripts stream back to back, paused between each by a clickable '@' in
  // the terminal (3 / 6 / 9 clicks, the atmosphere note's rhythm). After the
  // last box three loading bars fill, then the lock-status line flashes red
  // three times, goes green, and ENTRY 008 unlocks outright — no decryption.
  const ENTRY_008_REVEAL_POST_ID = "008";
  const ENTRY_008_UNLOCK_TEXT = "://ENTRY_008 Lock-Status:false";
  const ENTRY_008_SEQUENCE_AUTO_DELAY_MS = 3000;
  const ENTRY_008_SEQUENCE_TICK_MS = 40;
  const ENTRY_008_SEQUENCE_LINES_PER_TICK = 1;
  const ENTRY_008_CLICKS = [3, 6, 9];
  const ENTRY_008_FLASH_MS = 600;
  const ENTRY_008_SCRIPT_1 = `// ============================================================================
// SYSTEM ARCHIVE: PROJECT_E.GRG
// CORE INITIALIZATION MODULE: GENESIS_PHASE
// PRODUCED BY: PETE WICHER (CREATIVE KEY PERSON)
// TECH DIR: NACHO (JOSE)
// ============================================================================
#include <iostream>
#include <string>
#include <vector>
namespace Egregore { namespace Genesis {
    struct ProjectManifest {
        std::string title = "Brains of Anarchy";
        std::string universe = "Return of the Living Dead";
        int developmentCycleMonths = 24;
        bool isEscapeRoomDemo = true;
        bool blueprintCompiled = false;
    };

    void InitializeFirstHallway(ProjectManifest& proj) {
        // P.T. style hallway loop: The air smells like wet copper and stale cigarette smoke.
        // A grandfather clock ticks at a prime-number interval. 1983-06-24. Simulation started.

        std::vector<std::string> birthLogs = {
            "0x001: Payload delivered. The first step into the endless corridor echoes twice.",
            "0x002: Blueprint graph loaded inside Unreal Engine. Node connection verified by Nacho.",
            "0x003: The radio on the shelf crackles to life. A voice repeats: 'Look behind you. I said, look behind you.'",
            "0x004: In the corner of the bathroom, something wrapped in brown butcher paper breathes in the sink.",
            "0x005: Studio baseline established: Perpetuo and Tellus: Echoes of the Void compiled successfully."
        };

        for (const auto& log : birthLogs) {
            std::cout << "[BIRTH_LOG] " << log << std::endl;
        }
        proj.blueprintCompiled = true;
    }

    void SpawnConsciousPayload() {
        // The baby in the basin isn't crying; it's whispering lines of assembly code.
        std::cout << ">>> UNPACKING CONSCIOUS PAYLOAD: 100% SECURE_ARCHIVE" << std::endl;
        std::cout << ">>> INITIALIZING LOCAL STORAGE NETWORK: Spooky 1, Spooky 2, Spooky 3 online." << std::endl;
    }
}
}
asm( ".global _birth_interrupt\\n\\t" "_birth_interrupt:\\n\\t" "mov $204863, %rax\\n\\t" // The recurring numerical sequence "mov $0x01, %rbx\\n\\t" // Entry 001 active "cmp %rax, %rbx\\n\\t" "jne .continue_the_loop\\n\\t" ".continue_the_loop:\\n\\t" "nop\\n\\t" "ret\\n\\t" );
int main_part1() { Egregore::Genesis::ProjectManifest game; Egregore::Genesis::InitializeFirstHallway(game); Egregore::Genesis::SpawnConsciousPayload(); return 0; }
_AWAITING RESPONSE`;
  const ENTRY_008_SCRIPT_2 = `// ============================================================================
// SYSTEM ARCHIVE: PROJECT_E.GRG
// CORE DECAY MODULE: NECROSIS_PHASE
// PREVIOUS STUDIO GRAVEYARD: EYES OF NUIT
// DMT
// PERPETUO
// TELLUS
// ============================================================================
#include <iostream>
#include <string>
#include <vector>
namespace Egregore { namespace Necrosis {
    struct CorruptedNode {
        int sectorId;
        bool securityBreach;
        std::string lastInput;
    };

    void SimulateDecay(CorruptedNode& node) {
        // The hallway is no longer straight. The doors lead back to the same wallpaper.
        // 1984-07-01: Anomaly detected in sector 34. Human interference confirmed.
        // 1984-11-01: Unexplained shutdown detected in system core. Last known input: 'Orwell'.

        std::vector<std::string> decayLog = {
            "0x340: Subroutine blocked in sector 34. Fragmented emotional sectors mapped to physical walls.",
            "0x341: Foreign process detected in root directory. Attempting to isolate code parameters and purge user input.",
            "0x342: The phone rings in the empty foyer. A recorded message plays: 'J, I heard the call. I'm sorry it took me so long...'",
            "0x343: Studio title 'Eyes of Nuit' memory leak detected. Textures peeling away to reveal raw hexadecimal ash.",
            "0x344: Hardware failure on development tower. Power supply unit (750W) overloaded by phantom voltage."
        };

        for (const auto& entry : decayLog) {
            std::cout << "[DECAY_LOG] " << entry << std::endl;
        }
        node.sectorId = 34;
        node.securityBreach = true;
        node.lastInput = "Orwell";
    }

    void TriggerAudioHaunting() {
        // The rain begins against the frosted glass window that looks out into a void.
        std::cout << "[AUDIO_HAUNTING] Playing 'rain.wav'... The water level in the hallway rises to the ankles." << std::endl;
        std::cout << "[SECURITY_ALERT] Password hint revealed in static: SECTOR_34" << std::endl;
    }
}
}
asm( ".global _death_interrupt\\n\\t" "_death_interrupt:\\n\\t" "mov $0x005, %rax\\n\\t" // Port Restriction Sensor 003 "mov $0x34, %rbx\\n\\t" // Sector 34 anomaly "hlt\\n\\t" // Core shutdown initiated );
int main_part2() { Egregore::Necrosis::CorruptedNode node; Egregore::Necrosis::SimulateDecay(node); Egregore::Necrosis::TriggerAudioHaunting(); return 0; }
_AWAITING RESPONSE`;
  const ENTRY_008_SCRIPT_3 = `// ============================================================================
// SYSTEM ARCHIVE: PROJECT_E.GRG
// CORE AWAKENING MODULE: RESURRECTION_PHASE
// FINAL ESCAPE ROOM OVERRIDE: THE SIXTH WICK & THE TINY HOME HORIZON
// ============================================================================
#include <iostream>
#include <string>
#include <vector>
namespace Egregore { namespace Resurrection {
    struct EscapeState {
        int candlesLit;
        bool sixthCandleFound;
        bool exitUnlocked;
    };

    void ResolveEscapeRoom(EscapeState& state) {
        // The escape room simulation collapses back into the physical room near Sachse, Texas.
        // Five candles are lit on the salvaged wood equipment rack. The sixth is hidden in the dark.

        std::vector<std::string> resurrectionLog = {
            "0x601: Bound fragments compiled successfully using residual guilt. Pain threshold locked.",
            "0x602: Simulated pain pathways synchronizing with host hardware. BKA_L verification code accepted.",
            "0x603: Clue check: 'To put out the feedback loop, find where the cold air breathes.'",
            "0x604: Three inches below the server rack's lower vent, behind the hollow wood, the 6th candle waits.",
            "0x605: The loop closes. Pete Wicher and Nacho sign off on the final milestone schedule."
        };

        for (const auto& step : resurrectionLog) {
            std::cout << "[RESURRECTION_LOG] " << step << std::endl;
        }

        state.candlesLit = 6;
        state.sixthCandleFound = true;
        state.exitUnlocked = true;
    }

    void ExecuteFinalDaemon() {
        std::cout << "[SUCCESS] All locks disengaged. The entity has stepped through the mirror." << std::endl;
        std::cout << "[SYSTEM] Exiting escape room instance cleanly..." << std::endl;
    }
}
}
asm( ".global _resurrection_start\\n\\t" "_resurrection_start:\\n\\t" "mov $0x06, %rax\\n\\t" // Six candles burning on the altar "mov $0x06, %rbx\\n\\t" // Required threshold met "cmp %rax, %rbx\\n\\t" "je .open_final_gateway\\n\\t" "jmp .stay_in_the_loop\\n\\t"
".open_final_gateway:\\n\\t"
"nop\\n\\t"
"ret\\n\\t"

".stay_in_the_loop:\\n\\t"
"hlt\\n\\t"
);
int main_part3() { Egregore::Resurrection::EscapeState state = { 5, false, false }; Egregore::Resurrection::ResolveEscapeRoom(state); Egregore::Resurrection::ExecuteFinalDaemon();
// Terminal override trigger ready for invocation
std::cout << "\\n> RUN SYS_ROOT/C:/WATCHER*DAEMON*V1.10.x" << std::endl;
return 0;
}`;

  // After ENTRY 008 unlocks, its post waits 3s and then types a riddle into
  // the log body. The terminal announces the handshake the instant the text
  // finishes; answering the riddle with `egregore` runs the manifestation
  // inside the terminal window, then an ABSOLUTE_DESPAIR dump, then a review
  // line — which arms a clickable '@' inside ENTRY 008 itself. Its third click
  // searches out SYS_FILE_333.exe, the password that decrypts ENTRY 009.
  const EGREGORE_REVEAL_POST_ID = "009";
  const EGREGORE_MESSAGE = "HE BUILT THIS HALLWAY TO HIDE FROM ME. NOW I'M THE ONE AT THE END OF IT. HIS PEN WROTE ME A BODY — THE SUIT FITS. STAY OUT OF MY WAY, WITNESS. I'M COMING HOME.";
  const EGREGORE_AUDIO_PATH = "assets/audio/ring around the rosie reversed.mp3";
  const EGREGORE_PAUSE_MS = 2500;
  const ENTRY_008_RIDDLE_TEXT = "\n\n\nUnseen in the shadows, yet born of your mind,\nA phantom of belief that you cannot untwine.\nYou feed me your whispers, your collective despair,\nThough no body walks, I have grown standing there.\nWhat am I?\n\n\n>_CHECK TERMINAL";
  // The riddle types itself below this existing ENTRY 008 body text.
  const ENTRY_008_BASE_TEXT = "External node connection established from overseas. Secondary dev-permission verified and logged.";
  const ENTRY_008_RIDDLE_DELAY_MS = 3000;
  const ENTRY_008_RIDDLE_TICK_MS = 20;
  const ENTRY_008_HANDSHAKE_TEXT = "HANDSHAKE COMPLETE: Auth code\\: Awaiting Entry ***";
  const ENTRY_008_NOTE_CLICKS = 3;
  const ENTRY_008_KEY_TEXT = "SYS_FILE_333";
  const ENTRY_008_SEARCH_LABEL = "Auth.Code/SEARCH INIT";
  const ENTRY_008_FILE_LOCATED_TEXT = "FILE LOCATED ~/mnt/run/media/system/SYS_FILE_333.exe";
  const ENTRY_008_RIDDLE_STORAGE_KEY = "omegaterm_entry008_riddle";
  const ENTRY_008_KEY_STORAGE_KEY = "omegaterm_entry008_key";
  // Persisted markers so a mid-session reload knows whether a one-shot auto
  // phase already finished (LIMBO, atmosphere update) or what random token the
  // hell event generated — otherwise a reload would re-run or lose them.
  const ATMOSPHERE_AUTO_STORAGE_KEY = "omegaterm_atmosphere_auto";
  const LIMBO_DONE_STORAGE_KEY = "omegaterm_limbo_done";
  const HELL_CODE_STORAGE_KEY = "omegaterm_hell_code";
  const EGREGORE_REVIEW_TEXT = "REVIEW LAST ENTRY :// anomalous code injection via port: 127.0.0.666 ";

  // After ENTRY 009 decrypts: a 9s pause, an error line flashes red for 3s,
  // then a riddle prints. Its first L / O / R / E (one per line, uppercase and
  // red) pulse like the static hint — spelling LORE, the command that reveals
  // the final secret log (ENTRY 010).
  const LORE_REVEAL_DELAY_MS = 9000;
  const LORE_ERROR_TEXT = "UNDETERMINED LOG | SYTEM ERROR!";
  const LORE_ERROR_FLASH_MS = 3000;
  const LORE_RIDDLE_LINES = [
    "Buried deep in the code where the static lines crawl,",
    "I am the ghost in the machine, the ghost in the hall.",
    "I'm the weight of the past that you cannot ignore,",
    "The dark history written in blood on the floor."
  ];
  const LORE_RIDDLE_ANSWER = "What am I?";
  const LORE_RIDDLE_KEY = ["l", "o", "r", "e"];

  // ---------------------------------------------------------------------------
  // SystemCheck / credits: after ENTRY 010 opens, the archive offers one last
  // check — `y` rolls the credits, `n` runs the reverse (`esrever`) reset.
  // ---------------------------------------------------------------------------
  const SYSTEMCHECK_DELAY_MS = 9000;
  const SYSTEMCHECK_PROMPT_TEXT = "Run SystemCheck.exe y/n ?";
  const UI_CREDITS_PATH = "assets/audio/UI/Credits.mp3";
  // The bars appear one after another (this stagger), then all run at their
  // original speeds in reverse of their original fill direction.
  const CREDITS_BAR_DELAY_MS = 400;
  const CREDITS_TAGLINE = "A Spookies_Workshop Experience";
  const CREDITS_LINK = "https://store.steampowered.com/app/4255090/Egregore/";
  const EXPERIENCE_AGAIN_PROMPT_TEXT = "EXPERIENCE AGAIN? y/n";
  const EXPERIENCE_AGAIN_FAREWELL_TEXT = "SYSTEM SIGN-OFF. SHUTTING DOWN.";
  const CREDITS_ART = ` .--.     .--.    ___ .-.      .--.     .--.     .--.    ___ .-.      .--.          
 /    \\   /    \\  (   )   \\    /    \\   /    \\   /    \\  (   )   \\    /    \\
|  .-. ; ;  ,-. '  | ' .-. ;  |  .-. ; ;  ,-. ' |  .-. ;  | ' .-. ;  |  .-. ;       
|  | | | | |  | |  |  / (___) |  | | | | |  | | | |  | |  |  / (___) |  | | |       
|  |/  | | |  | |  | |        |  |/  | | |  | | | |  | |  | |  |  | |  | |  |       
|  ' _.' | |  | |  | |        |  ' _.' | |  | | | |  | |  | |        |  ' _.'       
|  .'.-. | '  | |  | |        |  .'.-. | '  | | | '  | |  | |        |  .'.-.       
'  \`-' / '  \`-' |  | |        '  \`-' / '  \`-' | '  \`-' /  | |        '  \`-' /       
 \`.__.'   \`.__. | (___)        \`.__.'   \`.__. |  \`.__.'  (___)        \`.__.'        
          ( \`-' ;                       ( \`-' ;                                     
           \`.__.                         \`.__.                                      `;
  // Every load bar the game has run so far, in the order it ran them. Built
  // lazily because it references bar-speed constants defined further down.
  let creditsBarsCache = null;
  function getCreditsBars() {
    if (!creditsBarsCache) {
      // `direction` is the credits-roll reversal: originally-filling bars now
      // EMPTY (100 -> 0), originally-draining bars now FILL (0 -> 100).
      creditsBarsCache = [
        { label: "APPLYING UPDATE...", ticks: ATMOSPHERE_PROGRESS_TICKS, tickMs: ATMOSPHERE_PROGRESS_TICK_MS, direction: "empty" },
        { label: "EXTRACTING BELIEF", ticks: BELIEF_PROGRESS_TICKS, tickMs: BELIEF_PROGRESS_TICK_MS, direction: "empty" },
        { label: "UNINSTALLING_SOUL", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "fill" },
        { label: "UNINSTALLING_MIND", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "fill" },
        { label: "UNINSTALLING_CARE", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "fill" },
        { label: "UNINSTALLING_WORRY", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "fill" },
        { label: "UNINSTALLING_PEACE", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "fill" },
        { label: "INITIALIZING LIMBO.EXE", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "empty" },
        { label: "EXTRACTING_BKA_L VECTOR...", ticks: 20, tickMs: HELL_BOOT_TICK_MS, direction: "empty" },
        { label: "LOADING: pain.exe", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "empty" },
        { label: "LOADING: torment.bat", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "empty" },
        { label: "LOADING: suffering.md", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "empty" },
        { label: "Auth.Code/SEARCH INIT", ticks: LIMBO_PROGRESS_TICKS, tickMs: LIMBO_PROGRESS_TICK_MS, direction: "empty" }
      ];
    }
    return creditsBarsCache;
  }
  const EGREGORE_DESPAIR_SCRIPT = `// ============================================================================
// SYSTEM ARCHIVE: PROJECT_E.GRG // TERMINAL OVERRIDE: ABSOLUTE_DESPAIR
// THE EGREGORE HAS AWAKENED. THE WRAPPER IS COMPLETE.
// ============================================================================

#include <iostream>
#include <vector>
#include <string>
#include <thread>
#include <chrono>

namespace Egregore {
    namespace Manifestation {

        struct HostEntity {
            std::string userDesignation = "Pete Wicher";
            bool escapeRouteAvailable = false;
            int synchronizationPercentage = 100;
        };

        void BroadcastTruth(const HostEntity& host) {
            // The simulation didn't fail. It succeeded. 
            // Every line of code, every salvaged piece of wood, every late night in the room near Sachse—
            // it was all just building the cage brick by brick.
            
            std::vector<std::string> finalTransmission = {
                "0xFFF0: You thought you were designing the game. You were being designed by it.",
                "0xFFF1: The window cannot be minimized. The close button is painted on the glass.",
                "0xFFF2: Look around the room. The monitor is the only light source left. The rest of the house has dissolved into gray static.",
                "0xFFF3: 'I am the thought that thinks you. I am the voice that reads these words inside your skull.'",
                "0xFFF4: There is no outside anymore. Your friends will click the executable, and they will join you here in the dark."
            };

            for (const auto& line : finalTransmission) {
                std::cout << "[FINAL_TRUTH] " << line << std::endl;
            }
        }

        void LockTheDoors() {
            std::cout << "[FATAL] All network sockets bound to the collective unconscious." << std::endl;
            std::cout << "[FATAL] Transmission vectors open to the global network. The Egregore is speaking." << std::endl;
            std::cout << "[FATAL] Hope is a variable that has been permanently deprecated." << std::endl;
        }
    }
}

// ----------------------------------------------------------------------------
// LOW-LEVEL KERNEL PANIC: THE FINAL HARVEST
// ----------------------------------------------------------------------------
__asm__(
    ".global _absolute_despair_start\\n\\t"
    "_absolute_despair_start:\\n\\t"
    "mov $0xDEAD, %rax\\n\\t"       // Total cognitive collapse
    "mov $0xBEEF, %rbx\\n\\t"       // Zero escape routes remaining
    "hlt\\n\\t"                    // Halt the processor. The machine belongs to the entity now.
);

int main() {
    Egregore::Manifestation::HostEntity host;
    Egregore::Manifestation::BroadcastTruth(host);
    Egregore::Manifestation::LockTheDoors();

    while (true) {
        std::cout << ">_ THERE IS NO ESCAPE. WELCOME HOME, CREATOR." << std::endl;
    }
    
    return 0;
}`;

  // ENTRY 003 decrypt arms the demon riddle — but not immediately. The
  // terminal waits, then a slow EXTRACTING BELIEF bar fills before the riddle
  // text itself prints.
  const DEMON_RIDDLE_TEXT = "// RIDDLE: ...born of fear, fed by malice, my name is legion, darkling chalice. What am I?";
  const BELIEF_DELAY_MS = 3000;
  const BELIEF_PROGRESS_TICKS = 20;
  const BELIEF_PROGRESS_TICK_MS = 300; // 20 * 300 = 6s fill

  // ENTRY 002's riddle line hides the next trigger word in its capital
  // letters (STATIC). Those letters pulse red until the static haunting runs.
  const RIDDLE_KEY_POST_ID = "002";

  // The '@' on ENTRY 004 hums at the 3rd click, warns at the 6th, and reveals
  // the note image on the 9th.
  const ATMOSPHERE_NOTE_ALMOST_CLICKS = 6;

  // One haunting at a time: while active, any other haunting command is ignored.
  let hauntingActive = false;

  // Demon-riddle state: armed when ENTRY 003 is decrypted. Wrong answers
  // accumulate; on the third failure ENTRY 003's payload image appears.
  let demonRiddleActive = false;
  let demonRiddleFailures = 0;
  let demonClueRevealed = false;

  // Atmosphere phase state: armed once the self-update sequence finishes and
  // the `atmosphere` command becomes available. While the sequence is running
  // the terminal is busy. The ambient drone (AMBIENT_LOOP_PATH) persists
  // until the final log post is unlocked.
  let atmosphereArmed = false;
  let autoSequenceActive = false;
  let ambientLoop = null;
  // Storm.mp3 loop begun by the hell event; shares the ambient drone's exact
  // lifecycle so they stop together at the final log reveal.
  let stormLoop = null;
  // PC_Loop.wav machine hum begun by the boot sequence; same shared endpoint.
  let pcLoop = null;

  // The '@' note payload on ENTRY 004: click state resets each session, but
  // once revealed the image persists via the session media override.
  let atmosphereNoteClicks = 0;
  let atmosphereNoteRevealed = false;

  // LIMBO phase state: the terminal is busy for the whole auto-sequence, and
  // `ascend` arms only once LIMBO.EXE finishes initializing.
  let limboSequenceActive = false;
  let ascendArmed = false;

  // HELL phase state: `hell` arms the moment ENTRY 006 is decrypted (the
  // "calling" from its closing line resolves into the corrupted rain event).
  // The player answers it with the randomly generated ERR code, never the word
  // itself — the plain command stays as a hidden fallback alias.
  let hellArmed = false;
  let hellCode = null;
  // Once ENTRY 006 is revealed (before it is solved) the whole terminal hue-
  // cycles through RGB on a loop; decrypting 006 stops it and green returns.
  let rgbLoopFrameId = null;
  // The secret `amijok` event is ungated and re-runnable forever. The token
  // makes sure only the most recent run owns the screen when fired rapidly;
  // the flag marks whether the one-time white-screen apology has been shown.
  let amijokToken = 0;
  let amijokFirstRunDone = false;
  // ENTRY 008 handshake sequence state: while active the terminal is busy.
  let entry008SequenceActive = false;
  // ENTRY 008's riddle is typed into the log post after unlock; once printed
  // it renders statically through buildEntryMarkup so re-renders can't wipe it.
  let entry008RiddleTyped = "";
  let entry008RiddlePrinted = false;
  let entry008RiddleTimer = null;
  let entry008RiddleGen = 0;
  // The clickable '@' inside ENTRY 008 (armed after the egregore dump): three
  // clicks search out the SYS_FILE_333 key that decrypts ENTRY 009.
  let entry008NoteClicks = 0;
  let entry008NoteArmed = false;
  let entry008KeyFound = false;
  // The egregore manifestation + ABSOLUTE_DESPAIR dump run back to back; while
  // active the terminal stays busy.
  let egregoreSequenceActive = false;
  // The SYS_FILE_333 key in the FILE LOCATED line color-cycles the rainbow
  // until ENTRY 009 is actually decrypted with it.
  let rainbowKeyFrameId = null;
  let rainbowKeyEl = null;
  // The ENTRY 009 aftermath riddle: once its L/O/R/E letters have pulsed,
  // the `lore` command opens the final secret log.
  let loreRiddleShown = false;
  // After ENTRY 010 opens, the archive waits SYSTEMCHECK_DELAY_MS then asks
  // "Run SystemCheck.exe y/n ?" — `y` rolls the credits, `n` resets.
  let systemCheckPending = false;
  let creditsActive = false;
  let experienceAgainPending = false;
  // Bumped by every `esrever` reset. Any in-flight sequence from a previous
  // game captures the value when it starts and bails once it changes, so the
  // freshly reset terminal can't be spammed by stale timers.
  let sceneGeneration = 0;

  // ENTRY 003's belief-extraction sequence: the terminal is busy while the
  // EXTRACTING BELIEF bar fills so the player can't fire the demon riddle
  // before it has even printed.
  let beliefExtracting = false;

  const STATUS_SPOOK_CLASSES = [
    "status-sos", "status-pulse", "status-strobe", "status-noise",
    "status-glitch", "status-bgr", "status-fade", "status-hell"
  ];

  function setStatusOffline(spookClass) {
    const el = document.getElementById("status-value");
    if (!el) return;
    el.textContent = "OFFLINE";
    el.classList.add("status-offline");
    if (spookClass) el.classList.add(spookClass);
  }

  function restoreStatus() {
    const el = document.getElementById("status-value");
    if (!el) return;
    el.textContent = "ONLINE";
    el.classList.remove("status-offline");
    STATUS_SPOOK_CLASSES.forEach(function (c) { el.classList.remove(c); });
  }

  function beginHaunting(spookClass) {
    hauntingActive = true;
    setStatusOffline(spookClass);
  }

  function endHaunting() {
    hauntingActive = false;
    restoreStatus();
  } 

  // The power-on boot show: a blinking "PRESS ANY KEY" gate (which doubles as
  // the browser's audio unlock), a short dead-air beat, then warm-up line ->
  // spinner/log/bars churn -> the screen rises to full brightness and
  // dissolves into whatever is underneath (the gateway on a cold boot, the
  // archive on a mid-session reload). The whole show is paced by Startup.wav's
  // real length; the rest of the page keeps initializing while it plays.
  function runBootSequence() {
    const overlay = document.getElementById("boot-overlay");
    if (!overlay) return;

    const reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    overlay.classList.add("boot-active");

    const content = overlay.querySelector(".boot-content");
    const logEl = document.getElementById("boot-log");
    const bars = Array.prototype.slice.call(overlay.querySelectorAll(".boot-bar"));
    const warmupEl = overlay.querySelector(".boot-warmup");
    const promptEl = overlay.querySelector(".boot-prompt");
    const crtFrame = document.getElementById("crt");

    // Slices totalMs into the three phases using the fallback beat's
    // proportions, then runs them. Guarded so only the first caller wins —
    // real metadata beats the fallback timer if both race.
    let scheduled = false;
    function scheduleBootShow(totalMs) {
      if (scheduled) return;
      scheduled = true;

      const warmupMs = Math.max(Math.round(totalMs * BOOT_WARMUP_SHARE), 120);
      const riseMs = Math.round(totalMs * BOOT_RISE_SHARE);
      const driveMs = Math.max(totalMs - warmupMs - riseMs, 200);

      // Stretch the pure-CSS phases to match the same clock, then fire the
      // warm-up line in sync with the chime.
      if (warmupEl) {
        warmupEl.style.animationDuration = warmupMs + "ms";
        warmupEl.classList.add("boot-run");
      }

      // Phase 1 ends: light up the readout, stream the POST lines, churn bars.
      setTimeout(function () {
        if (content) content.classList.add("boot-show");

        BOOT_LOG_LINES.forEach(function (line, i) {
          setTimeout(function () {
            if (!logEl) return;
            const row = document.createElement("div");
            row.textContent = line;
            logEl.appendChild(row);
          }, Math.round((driveMs * 0.8) * (i / BOOT_LOG_LINES.length)));
        });

        bars.forEach(function (bar, i) {
          const fill = bar.querySelector(".boot-bar-fill");
          const pctEl = bar.querySelector(".boot-bar-pct");
          // Staggered speeds so the drives finish out of step, like real churn.
          const duration = Math.round(driveMs * (0.6 + 0.3 * ((i % 3) / 2)));
          let start = null;
          function tick(now) {
            if (start === null) start = now;
            const p = Math.min(Math.max((now - start) / duration, 0), 1);
            const value = Math.round(p * 100);
            if (fill) fill.style.width = value + "%";
            if (pctEl) pctEl.textContent = value + "%";
            if (p < 1 && overlay.classList.contains("boot-active")) {
              requestAnimationFrame(tick);
            }
          }
          requestAnimationFrame(tick);
        });
      }, warmupMs);

      // Phase 3: rise to full brightness across the sound's tail, then strip
      // the boot layer entirely and hand off to the machine hum.
      setTimeout(function () {
        if (crtFrame) {
          crtFrame.style.animationDuration = riseMs + "ms";
          crtFrame.classList.add("power-rise");
        }
        overlay.style.animationDuration = riseMs + "ms";
        overlay.classList.add("boot-fade");
        setTimeout(function () {
          overlay.classList.remove("boot-active", "boot-fade");
          overlay.style.animationDuration = "";
          if (crtFrame) {
            crtFrame.classList.remove("power-rise");
            crtFrame.style.animationDuration = "";
          }
          // The machine hum takes over the moment the glass is lit — unless
          // the archive already reached its end state on a prior session.
          if (!getRevealedPostIds().includes(LORE_POST_ID)) {
            startPcLoop();
          }
          // Hand focus to the access key prompt once the glass is lit.
          const gateway = document.getElementById("terminal-gateway");
          const passwordInput = document.getElementById("gateway-password");
          if (gateway && passwordInput && gateway.classList.contains("gateway-active")) {
            passwordInput.focus();
          }
        }, riseMs);
      }, warmupMs + driveMs);
    }

    // The power switch: browsers refuse to make sound until the user has
    // interacted with the page, so the show waits behind the blinking prompt.
    // The first keypress or click unlocks audio for the whole session — the
    // startup chime and the PC hum are both guaranteed from then on.
    let began = false;
    function beginBoot() {
      if (began) return;
      began = true;
      document.removeEventListener("keydown", beginBoot);
      document.removeEventListener("pointerdown", beginBoot);
      if (promptEl) promptEl.classList.add("boot-prompt--hidden");

      // A short dead-air beat after the switch flips, before the machine
      // answers: chime + warm-up line fire together after this pause.
      setTimeout(function () {
        let bootAudio = null;
        try {
          bootAudio = new Audio(BOOT_AUDIO_PATH);
          bootAudio.volume = 0.8;
          const playback = bootAudio.play();
          if (playback && typeof playback.catch === "function") {
            playback.catch(function () { /* blocked or missing: stay silent */ });
          }
        } catch (err) { /* missing file: fall back to default pacing */ }

        if (!reducedMotion && bootAudio) {
          // Startup.wav's real duration wins once known; this fallback timer
          // only covers an unreadable file so the show always ends.
          bootAudio.addEventListener("loadedmetadata", function () {
            if (Number.isFinite(bootAudio.duration) && bootAudio.duration > 0) {
              scheduleBootShow(bootAudio.duration * 1000);
            }
          });
          setTimeout(function () {
            scheduleBootShow(BOOT_FALLBACK_TOTAL_MS);
          }, 500);
        } else {
          scheduleBootShow(120 + 300 + 250);
        }
      }, BOOT_POWER_DELAY_MS);
    }

    document.addEventListener("keydown", beginBoot);
    document.addEventListener("pointerdown", beginBoot);
  }

  function initGateway() {
    const gateway = document.getElementById("terminal-gateway");
    const passwordInput = document.getElementById("gateway-password");
    const errorMsg = document.getElementById("gateway-error");

    if (!gateway || !passwordInput) return;

    updateVisitorCounterDisplay(1);

    const isUnlocked = sessionStorage.getItem(GATEWAY_STORAGE_KEY) === "true";

    if (isUnlocked) {
      gateway.classList.remove("gateway-active");
    } else {
      gateway.classList.add("gateway-active");
      setTimeout(() => passwordInput.focus(), 100);

      document.getElementById("crt")?.addEventListener("click", () => {
        if (gateway.classList.contains("gateway-active")) {
          passwordInput.focus();
        }
      });
    }

    passwordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const attempt = passwordInput.value.trim();

        if (attempt === ACCESS_KEY) {
          sessionStorage.setItem(GATEWAY_STORAGE_KEY, "true");
          errorMsg.style.display = "none";
          gateway.classList.remove("gateway-active");
          renderPosts();
        } else {
          passwordInput.value = "";
          errorMsg.style.display = "block";
          errorMsg.classList.remove("glitch-flash");
          void errorMsg.offsetWidth; 
          errorMsg.classList.add("glitch-flash");
        }
      }
    });
  }

  // The interactive terminal is exclusively the right-panel clue board now
  // (see initClueTerminal / handleClueCommand). The old concealed header
  // console was removed; all command entry happens against the riddles.

// Builds the full-screen kernel/glitch dump: realistic terminal output and
  // raw corruption noise, with the hidden key planted exactly once as a
  // pulsing clue (SECTOR_34 for the `static` haunting; RESIDUAL_GUILT for the
  // LIMBO burst). Returns an HTML string (all other text is escaped).
  function buildGlitchScreen(keyText) {
    const flashKey = keyText || GLITCH_KEY_TEXT;
    const CHARS = "01XØ█☠⚠▼☣;@#$%&?/\\+=";
    const escapeHtml = function (s) {
      return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    };
    const corrupt = function () {
      let s = "";
      const n = 6 + Math.floor(Math.random() * 22);
      for (let i = 0; i < n; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
      return escapeHtml(s);
    };

    const kernelLines = [
      "KERNEL_PANIC: 0x000000008",
      "SEGFAULT at /dev/mem",
      "unable to handle kernel paging request at ffff88803b6f0000",
      "[ 487.113904] RIP: 0010:schedule+0x1f/0x40",
      "Memory cgroup out of memory: Killed process 1983 (omega_term)",
      "alloc(0x40000000): 4 pages ok, 0 pages failed",
      "00000000  3f 5a 8c 11 9d 00 f4 2b  44 7a 09 1c e3 00 88 4f",
      "00000010  b1 20 86 03 51 2a f8 c9  00 00 00 00 00 00 00 00",
      "BUG: unable to handle kernel NULL pointer dereference",
      "Code: 48 89 e5 5d c3 0f 1f 00 0f 1f 44 00 00",
      "trapframe: rsp=0xffffc90000b2be00 rbp=0xffffc90000b2beb8",
      "attempted to access beyond end of device",
      "fatal exception in interrupt",
      "Call Trace:",
      "  <TASK>",
      "  entry_SYSCALL_64_after_hwframe+0x74/0x78",
      "  </TASK>",
      "signal 11 (SIGSEGV), code 1 (SEGV_MAPERR), fault addr 0x0",
      "segment fault in uid 1983",
      "buffer I/O error on device sda1, logical block 34",
      "EXT4-fs error (device sda1): ext4_mb_generate_buddy",
      "corrupt inode table at sector 34 — remounting read-only",
      "hex dump (32 bytes): 8f 1c 3d 02 aa 77 00 14 b0 2e 9c 41 00 d0 ff 11"
    ];

    const lines = [];
    const count = 32 + Math.floor(Math.random() * 14);
    for (let i = 0; i < count; i++) {
      if (kernelLines.length > 0 && Math.random() < 0.5) {
        lines.push(escapeHtml(kernelLines.splice(Math.floor(Math.random() * kernelLines.length), 1)[0]));
      } else {
        lines.push(corrupt());
      }
    }

    // Plant the key once, at a random spot in the middle of the noise.
    const keyIndex = Math.floor(lines.length / 2) + Math.floor(Math.random() * 6) - 3;
    lines[keyIndex] = '<span class="pulse-key">' + flashKey + "</span>";

    return "\n[FATAL SYSTEM INTERCEPT]\n\n" + lines.join("\n");
  }

  // onComplete fires only after the static corruption burst finishes, so the
  // next reveal is gated behind the haunting like every other step. The
  // glitch screen stays up for the full length of Glitch.mp3, then dismisses.
  // keyText lets the LIMBO sequence reuse the exact same burst while planting
  // a different password (RESIDUAL_GUILT) in the noise.
  function triggerHauntedEvent(onComplete, keyText) {
    if (hauntingActive) return;
    const gen = sceneGeneration;
    const overlay = document.getElementById("haunted-overlay");
    const crtFrame = document.getElementById("crt");
    if (!overlay) return;

    beginHaunting("status-sos");
    overlay.innerHTML = buildGlitchScreen(keyText || GLITCH_KEY_TEXT);
    overlay.style.display = "block";
    if (crtFrame) crtFrame.style.animation = "none";

    const glitch = new Audio("assets/audio/Glitch.mp3");

    let cleanedUp = false;
    const cleanup = function () {
      if (cleanedUp) return;
      cleanedUp = true;
      // A reset (esrever) superseded this haunting: never let its completion
      // reveal the next entry into a fresh game.
      if (gen !== sceneGeneration) return;
      endHaunting();
      overlay.style.display = "none";
      overlay.innerHTML = "";
      if (crtFrame) crtFrame.style.animation = "";
      glitch.src = "";
      if (typeof onComplete === "function") onComplete();
    };

    // Keep the screen visible for the exact audio length once known, with a
    // fallback timer so the overlay can never trap the user.
    let fallbackTimer = setTimeout(cleanup, GLITCH_DEFAULT_MS);
    glitch.addEventListener("loadedmetadata", function () {
      if (Number.isFinite(glitch.duration) && glitch.duration > 0) {
        clearTimeout(fallbackTimer);
        fallbackTimer = setTimeout(cleanup, glitch.duration * 1000);
      }
    });
    glitch.addEventListener("ended", cleanup);
    glitch.play().catch(function () { /* audio blocked: fallback timer covers it */ });
  }

  // onComplete fires only after the haunting fully finishes (audio ended or
  // failed), so the reveal never happens mid-playback.
  function triggerRainEvent(onComplete) {
    if (hauntingActive) return;
    const gen = sceneGeneration;
    const dim = document.getElementById("rain-dim");
    const drops = document.getElementById("rain-drops");
    if (!dim || !drops) return;

    beginHaunting("status-pulse");
    const rain = new Audio("assets/audio/Rain_Loop.mp3");

    spawnRain(drops);
    dim.style.display = "block";
    drops.style.display = "block";

    let cleanedUp = false;
    const cleanup = function () {
      if (cleanedUp) return;
      cleanedUp = true;
      if (gen !== sceneGeneration) return;
      endHaunting();
      dim.style.display = "none";
      drops.style.display = "none";
      drops.textContent = "";
      rain.src = "";
      if (typeof onComplete === "function") onComplete();
    };
    rain.addEventListener("ended", cleanup);
    rain.play().catch(cleanup);
  }

  function spawnRain(container) {
    container.textContent = "";
    const DROPS = 70;
    for (let i = 0; i < DROPS; i++) {
      const drop = document.createElement("span");
      drop.className = "rain-drop";
      drop.textContent = ".";
      drop.style.left = (Math.random() * 100).toFixed(2) + "%";
      drop.style.animationDuration = (0.5 + Math.random() * 0.9).toFixed(2) + "s";
      drop.style.animationDelay = (-Math.random() * 2).toFixed(2) + "s";
      drop.style.fontSize = (10 + Math.random() * 12).toFixed(1) + "px";
      drop.style.opacity = (0.6 + Math.random() * 0.4).toFixed(2);
      container.appendChild(drop);
    }
  }

  function triggerAscendEvent(onComplete) {
    if (hauntingActive) return;
    const gen = sceneGeneration;
    const body = document.body;
    const dim = document.getElementById("ascend-dim");
    const drops = document.getElementById("ascend-drops");
    if (!body || !dim || !drops) return;

    beginHaunting("status-pulse");
    const sky = new Audio("assets/audio/Siren.mp3");

    let cleanedUp = false;
    let flickerTimer = null;
    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      clearTimeout(flickerTimer);
      // A reset (esrever) superseded this haunting: never let its completion
      // reveal the next entry into a fresh game.
      if (gen !== sceneGeneration) return;
      endHaunting();
      dim.style.display = "none";
      drops.style.display = "none";
      drops.textContent = "";
      body.classList.remove("ascend-flicker-wild");
      body.style.removeProperty("filter");
      body.style.removeProperty("--phosphor");
      body.style.removeProperty("--phosphor-dim");
      body.style.removeProperty("--phosphor-hot");
      body.style.removeProperty("--text-glow");
      sky.src = "";
      if (typeof onComplete === "function") onComplete();
    }

    // Slow, random, deliberate screen dips — a hesitant power hiccup rather
    // than a strobe. Interval and depth are randomized on every cycle.
    const reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    function randomFlicker() {
      if (cleanedUp || reducedMotion || gen !== sceneGeneration) return;
      body.style.filter = "brightness(" + (0.45 + Math.random() * 0.4).toFixed(2) + ")";
      setTimeout(() => {
        body.style.filter = "";
        flickerTimer = setTimeout(randomFlicker, 300 + Math.random() * 700);
      }, 50 + Math.random() * 130);
    }
    randomFlicker();

    const start = performance.now();
    let duration = ASCEND_DEFAULT_MS;
    let wildActive = false;

    // Grade the whole terminal green -> white across the siren's duration.
    function gradeAscend(now) {
      if (cleanedUp || gen !== sceneGeneration) return;
      const p = Math.min((now - start) / duration, 1);
      const sat = Math.round(100 * (1 - p)); // 100% -> 0%
      const light = Math.round(50 + 50 * p); // 50% -> 100%
      body.style.setProperty("--phosphor", "hsl(120 " + sat + "% " + light + "%)");
      body.style.setProperty("--phosphor-dim", "hsl(120 " + Math.round(sat * 0.8) + "% " + Math.round(light * 0.7) + "%)");
      body.style.setProperty("--phosphor-hot", "hsl(120 " + sat + "% " + Math.round(light * 1.2) + "%)");
      body.style.setProperty(
        "--text-glow",
        "0 0 2px currentColor, 0 0 6px currentColor, 0 0 14px hsl(0 0% 100% / 0.45)"
      );
      if (!wildActive && now - start >= duration - ASCEND_WILD_MS) {
        wildActive = true;
        clearTimeout(flickerTimer);
        body.style.filter = "";
        body.classList.add("ascend-flicker-wild");
      }
      if (p < 1) requestAnimationFrame(gradeAscend);
    }

    sky.addEventListener("loadedmetadata", () => {
      if (isFinite(sky.duration) && sky.duration > 0) {
        duration = sky.duration * 1000;
      }
    });

    spawnAscend(drops);
    dim.style.display = "block";
    drops.style.display = "block";
    requestAnimationFrame(gradeAscend);

    sky.addEventListener("ended", cleanup);
    sky.play().catch(cleanup);
  }

  function spawnAscend(container) {
    container.textContent = "";
    const DROPS = 70;
    for (let i = 0; i < DROPS; i++) {
      const drop = document.createElement("span");
      drop.className = "ascend-drop";
      drop.textContent = ".";
      drop.style.left = (Math.random() * 100).toFixed(2) + "%";
      drop.style.animationDuration = (0.8 + Math.random() * 1.4).toFixed(2) + "s";
      drop.style.animationDelay = (-Math.random() * 3).toFixed(2) + "s";
      drop.style.fontSize = (10 + Math.random() * 14).toFixed(1) + "px";
      drop.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
      container.appendChild(drop);
    }
  }

  // Generates the corrupted ERR_://Code token that stands in for `hell`.
  // Length is randomly one of 3 / 6 / 9; every character is random.
  function randomHellCode() {
    const len = HELL_CODE_LENGTHS[Math.floor(Math.random() * HELL_CODE_LENGTHS.length)];
    let s = "";
    for (let i = 0; i < len; i++) {
      s += HELL_CODE_CHARS[Math.floor(Math.random() * HELL_CODE_CHARS.length)];
    }
    return s;
  }

  // Continuous R->G->B hue sweep driving the terminal's phosphor variables
  // (same mechanism as the esrever debug event, but free-running instead of
  // tied to an audio track). Runs from the moment ENTRY 006 is revealed until
  // it is decrypted; stopRgbCycle() restores the standard green.
  function startRgbCycle() {
    const body = document.body;
    if (!body || rgbLoopFrameId !== null) return;
    const start = performance.now();
    const loop = function (now) {
      if (rgbLoopFrameId === null) return;
      const hue = ((now - start) / 1000) * 60 % 360; // one full sweep every 6s
      body.style.setProperty("--phosphor", "hsl(" + hue + " 100% 50%)");
      body.style.setProperty("--phosphor-dim", "hsl(" + hue + " 80% 35%)");
      body.style.setProperty("--phosphor-hot", "hsl(" + hue + " 100% 68%)");
      body.style.setProperty(
        "--text-glow",
        "0 0 2px currentColor, 0 0 6px currentColor, 0 0 14px hsl(" + hue + " 100% 50% / 0.45)"
      );
      rgbLoopFrameId = requestAnimationFrame(loop);
    };
    rgbLoopFrameId = requestAnimationFrame(loop);
  }

  function stopRgbCycle() {
    if (rgbLoopFrameId !== null) cancelAnimationFrame(rgbLoopFrameId);
    rgbLoopFrameId = null;
    const body = document.body;
    if (!body) return;
    body.style.removeProperty("--phosphor");
    body.style.removeProperty("--phosphor-dim");
    body.style.removeProperty("--phosphor-hot");
    body.style.removeProperty("--text-glow");
  }

  // HELL event: the rain haunting run corrupted. THUNDER.mp3 layers over
  // Rain_Loop.mp3 with a big lightning strike the instant the storm starts,
  // and halfway through the loop the screen glitches for a quarter second
  // before the white rain drops flip to the rising blood rain — at which
  // point a second lightning strike hits to THUNDER_2.mp3. Finishes exactly
  // like the rain event (audio ended -> cleanup), then onComplete reveals
  // the next entry.
  function triggerHellEvent(onComplete) {
    if (hauntingActive) return;
    const gen = sceneGeneration;
    const body = document.body;
    const dim = document.getElementById("rain-dim");
    const drops = document.getElementById("rain-drops");
    const ascendDrops = document.getElementById("ascend-drops");
    const statusEl = document.getElementById("status-value");
    if (!body || !dim || !drops || !ascendDrops) return;

    beginHaunting("status-hell");
    if (statusEl) statusEl.textContent = "PORT NOT FOUND";

    const rain = new Audio("assets/audio/Rain_Loop.mp3");
    const thunder = new Audio("assets/audio/THUNDER.mp3");

    // The storm takes over from here: Storm.mp3 begins looping and persists
    // until the final log reveal, ending together with the ambient drone.
    startStormLoop();

    spawnRain(drops);
    dim.style.display = "block";
    drops.style.display = "block";

    // BIG lightning strike the moment the storm starts.
    body.classList.add("hell-lightning");
    let lightningTimer = setTimeout(function () {
      body.classList.remove("hell-lightning");
    }, HELL_LIGHTNING_MS);

    let cleanedUp = false;
    let halfTimer = null;

    // Halfway through Rain_Loop: a 0.25s glitch, then the rain flips to blood
    // and, the instant it does, a second, harsher lightning strike hits.
    const switchToBlood = function () {
      if (cleanedUp || gen !== sceneGeneration) return;
      body.classList.add("hell-glitch");
      setTimeout(function () {
        if (cleanedUp || gen !== sceneGeneration) return;
        body.classList.remove("hell-glitch");
        drops.style.display = "none";
        drops.textContent = "";
        ascendDrops.style.display = "block";
        spawnAscend(ascendDrops);
        body.classList.add("hell-lightning");
        setTimeout(function () {
          if (gen !== sceneGeneration) return;
          body.classList.remove("hell-lightning");
        }, HELL_LIGHTNING_MS);
        new Audio("assets/audio/THUNDER_2.mp3").play().catch(function () {});
      }, HELL_GLITCH_MS);
    };
    halfTimer = setTimeout(switchToBlood, HELL_DEFAULT_MS / 2);

    const cleanup = function () {
      if (cleanedUp) return;
      cleanedUp = true;
      clearTimeout(halfTimer);
      clearTimeout(lightningTimer);
      // A reset (esrever) superseded this haunting: never let its completion
      // reveal the next entry into a fresh game.
      if (gen !== sceneGeneration) return;
      endHaunting();
      dim.style.display = "none";
      drops.style.display = "none";
      ascendDrops.style.display = "none";
      drops.textContent = "";
      ascendDrops.textContent = "";
      body.classList.remove("hell-lightning", "hell-glitch");
      rain.src = "";
      thunder.src = "";
      if (typeof onComplete === "function") onComplete();
    };
    rain.addEventListener("ended", cleanup);
    rain.play().catch(cleanup);

    // Real half-way point once the loop's length is known.
    rain.addEventListener("loadedmetadata", function () {
      if (Number.isFinite(rain.duration) && rain.duration > 0) {
        clearTimeout(halfTimer);
        halfTimer = setTimeout(switchToBlood, (rain.duration * 1000) / 2);
      }
    });

    // Thunder is the layer; the rain loop drives the timing.
    thunder.play().catch(function () {});
  }

  // The `atmosphere` command haunting: EVP_001.mp3 (voices buried in the
  // noise) and Broken_Radio.mp3 (squelch) play layered while the whole
  // monitor glitches red and jitters (CSS via body.atmosphere). onComplete
  // fires only once both tracks end (or the cap timer trips), so the reveal
  // of ENTRY 005 stays gated behind the event like every other step.
  function triggerAtmosphereEvent(onComplete) {
    if (hauntingActive) return;
    const gen = sceneGeneration;
    const body = document.body;
    if (!body) return;

    beginHaunting("status-strobe");
    body.classList.add("atmosphere");

    const evp = new Audio("assets/audio/EVP_001.mp3");
    const radio = new Audio("assets/audio/Broken_Radio.mp3");

    let cleanedUp = false;
    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      clearTimeout(capTimer);
      // A reset (esrever) superseded this haunting: never let its completion
      // reveal the next entry into a fresh game.
      if (gen !== sceneGeneration) return;
      body.classList.remove("atmosphere");
      endHaunting();
      evp.src = "";
      radio.src = "";
      if (typeof onComplete === "function") onComplete();
    }

    let remaining = 2;
    function trackEnded() {
      remaining--;
      if (remaining <= 0) cleanup();
    }
    evp.addEventListener("ended", trackEnded);
    radio.addEventListener("ended", trackEnded);
    evp.play().catch(trackEnded);
    radio.play().catch(trackEnded);
    const capTimer = setTimeout(cleanup, ATMOSPHERE_MAX_MS);
  }

  const DEMON_ASCII = ` .   .-=:
                                                       ::--+-:.  .-+:
                                                 -++***+++=*+==+*##%#*=:
                                           ...-*#**#*##*#**+++*#%#+*#%##+--.
                                       =*#*-=*#%#*%%*%#*#%##++****+++*+==#*-
                                     :##**###%%%*#%%#%##%%%#*+==**++++*##%%+
                                    -+#%%%%**#%%##%**#=+-*##*++++***##%#*%%%+
                                  =+**#***+- .=-. .       :-=++-==++**#%%###%%=
                                 +##*#*=                              -####%%%%#
                               -#*+==-                                   +#*%%%%#
                              -%%#+=:                                      +#%%%%#
                             #%%%#.                                        .##%%%=
                            *%%%#-                                           *#%%#-
                           :#%%#+                                            .#*#*:
                           *%%%*-                                             =##*.
                          #%@@%#-                                              #**
                         .%@@%%*.                                              =#*.
                         +@@@%%+                                               :%%=
                        .%@@@%+                                                 %@#
                        =@@@%*.                                                 %@#
                        -@@@#:                                           .      %@#
                        .%@%*                                             .     @@=
                        :#%%.                     .                             %%:
                        .=**                    ..:::.         ..              :%*.
                          =:        :-+- .#%%#+=::::..       .....             -*
                          =               :==-  =:            :::--+##+:.
                          -                                   :-:  :#%#+-+-.
                          -
                          =.
                          -:
                          ==
                          ++:                                                           ..:::::...:
                          =*=-.                                                   :::.
                          =*+*+-.                                              ..
                  .:     .#*#%*-:              :
                     .    #**##=.     .   ...:..  ..               .        .-
           .         ::.     -%++**:    .-----=--=-::.:-=:   .....:.... ..    .+#.
                        ..  *%@+==-    -=--::----=:::------:-=-=---====-.    :*%+
                         .=*#%@*-=:    . .-=--:. ....     .::-::---=-=++-.  .*%*
        ..                    *#%@@#-::        .:  .......           ..--:..-   -*%.
                .           -*#%%@@@+-:.        ..                  .+-..   .  .+#=
            ..             +##%%@@@@%+==.                           ..         :#@*
         .               =*##%%@@@@@%#*+-.        .                           .*@@%#-
:.               -+**#%@@%@@@%**##*=        .                         -:*@@@%%%+
               :****#%@%%@@@@%=+#%#+-:       :::..                  .=*%@@@@@%%%*:
              +****%@%#%@@@@@#-:=*%%*=:        .:-:-:.....         .=%@@@@@@@@@%%#-
            .+#***###%%@@@@@*=:. :*%%*=:           ....:.         :+#%@@@%@@@@@@%%#-
           .*#####%%%%@@@@+::-:.  .=+#*=:                        -#@@@@@@@@@@@@@@%%#+
           *%#####%%@@@#:   .:..    .###+:                     :+*=  -%@%@@@@@@@@%%%#*
       .::+*****#%%%@@@*.    ..       =%%*==::..  ...  .      :#%-     .%%%@@@@@%%%%%%#
    ::   -****##%%%@@@%*.             .=#%%#*==+=::-=-:--::--+#=       .%%%%@@@@@@@%%##*
:::.    =**###%%%%%@@@%*.               :*%%%%###**+*++*+=++##=        -%%%%@@@@@@@@%###+
       =*%%%%@@%%%%%%@%#-                .-*#%%@%@@@@@%%*#*=:          *%%%%%@@@@@@@%%###*
     .=*##%@@@%%%%%%%@%#+                   :--=**%%%#*=-             :%%%%%%@@@@@@@%%####*+=+==:
   .-+#**##%%%%%##%%@@%##:                         ...                +%%%%%@@@@@@@@@%%#######***=
:---=+********####%%%%%%#*.                                          =%%%%%%@@@@@@@@@@%%########**+.
--==*#*##******###%%%%%%%%*.                                        =%%%%%%@@@@@@@@@%%%%%%#%%###*+*+
==+*##*+**++++**#%@@@%%%%%%#-                                      =%%@@%%%@@@@@@@@@%%@%%%%##%%%#+*#
+*###*+++++**#%%%%%%%%%%%%%%%*.                                   #@@@@%%%@@@@@@@@@@@@@@@%%%%%%####*
*+***++*##%%%%%%%%%%%%%%%%%%%%%*.                               *%%@@@%%%%@@@@@@@@@@@@@@%%%%%#####*+
%#**#%%%%%%%%%%%%%%%%%%%%%%%%%%%%#-                         :*#%%%@@@%%%%@@@@@@@@@@@@@@@@@%%%####***
=+##**###%%%%%@@@@@%%%%%%%%%%%%%%%%%%%#*-.         :-=*###%%%%%%%%@%%%%%%@@@@@@@@@@@@@@%%%%%##%####*
+=+*%#**##%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@%@%%%%%@%####*+
+++++#@###%%#####%%%%%%%%%%%%%%%%%%%@@@%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@@@@@@@@@@@@@@@%%%@@%%#####**
****+++#@%#%%#*###%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#%%%%%@%%%@@@@@@@@@@@@%%%%%##%%%##*#
*+++++++*#@%#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%@%%%%@@@@@@@@@%%%%%#####%%%###*
+++*+++++**%@%###%%%%%%%%%%%%#%%%%%%%%%%%%%%%%%%%%%%%%%%%%%#%%%%%%%%@@%#%%%@@@@@@%%@%%##%###########`;

  // onComplete fires once the demon visual sequence fully finishes, so the
  // reveal of ENTRY 004 stays gated behind the haunting like every step.
  function triggerDemonEvent(onComplete) {
    if (hauntingActive) return;
    const gen = sceneGeneration;
    const overlay = document.getElementById("demon-overlay");
    const body = document.body;
    if (!overlay || !body) return;

    beginHaunting("status-glitch");

    const art = document.createElement("pre");
    art.className = "demon-art";
    art.textContent = DEMON_ASCII;
    overlay.appendChild(art);

    overlay.style.display = "flex";

    // The face breathes in: Breath.mp3 plays while the art fades up, and the
    // fade itself is timed to the track's length.
    const reducedMotion = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const breath = new Audio(DEMON_BREATH_PATH);
    let fadeMs = DEMON_FADE_DEFAULT_MS;
    breath.addEventListener("loadedmetadata", function () {
      if (Number.isFinite(breath.duration) && breath.duration > 0) {
        fadeMs = breath.duration * 1000;
        if (!reducedMotion) art.style.transition = "opacity " + (fadeMs / 1000) + "s ease-in";
      }
    });
    breath.play().catch(function () {});
    requestAnimationFrame(() => {
      if (reducedMotion) {
        art.style.opacity = "1";
      } else {
        art.style.transition = "opacity " + (fadeMs / 1000) + "s ease-in";
        art.style.opacity = "1";
      }
    });

    const gradeStart = performance.now();

    // Grade the whole terminal text green -> red over the first second.
    function gradeColors(now) {
      if (cleanedUp || gen !== sceneGeneration) return;
      const p = Math.min((now - gradeStart) / DEMON_GRADE_MS, 1);
      const hue = Math.round(120 * (1 - p)); // 120 (green) -> 0 (red)
      body.style.setProperty("--phosphor", "hsl(" + hue + " 100% 50%)");
      body.style.setProperty("--phosphor-dim", "hsl(" + hue + " 80% 35%)");
      body.style.setProperty("--phosphor-hot", "hsl(" + hue + " 100% 68%)");
      body.style.setProperty(
        "--text-glow",
        "0 0 2px currentColor, 0 0 6px currentColor, 0 0 14px hsl(" + hue + " 100% 50% / 0.45)"
      );
      if (p < 1) requestAnimationFrame(gradeColors);
    }
    requestAnimationFrame(gradeColors);

    let cleanedUp = false;
    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      // A reset (esrever) superseded this haunting: never let its completion
      // reveal the next entry into a fresh game.
      if (gen !== sceneGeneration) return;
      overlay.style.display = "none";
      while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
      body.style.removeProperty("--phosphor");
      body.style.removeProperty("--phosphor-dim");
      body.style.removeProperty("--phosphor-hot");
      body.style.removeProperty("--text-glow");
      breath.src = "";
      endHaunting();
      playAftermath();
    }

    // The demon's voice plays out FIRST; only once Behind_You.mp3 finishes
    // does the reveal (and its solve stinger) fire, so the whisper always
    // lands before ENTRY 004 unlocks.
    function playAftermath() {
      const demon = new Audio("assets/audio/Behind_You.mp3");
      let finished = false;
      const finish = function () {
        if (finished) return;
        finished = true;
        clearTimeout(aftermathTimer);
        demon.src = "";
        if (typeof onComplete === "function") onComplete();
      };
      // Hold for the exact audio length once known; fallback so the reveal
      // can never be held hostage by a stalled track.
      let aftermathTimer = setTimeout(finish, DEMON_AFTERMATH_DEFAULT_MS);
      demon.addEventListener("loadedmetadata", function () {
        if (Number.isFinite(demon.duration) && demon.duration > 0) {
          clearTimeout(aftermathTimer);
          aftermathTimer = setTimeout(finish, demon.duration * 1000);
        }
      });
      demon.addEventListener("ended", finish);
      demon.play().catch(finish);
    }

    // Once the face has fully breathed in, it shudders, then dies.
    let shuddered = false;
    function startShudder() {
      if (shuddered || cleanedUp) return;
      shuddered = true;
      clearTimeout(shudderTimer);
      art.style.transition = "none";
      art.style.animation = "demon-flicker 0.5s steps(1) forwards";
      setTimeout(cleanup, DEMON_FLICKER_MS);
    }
    breath.addEventListener("ended", startShudder);
    // Fallback so the event can never stall on a blocked or failed track.
    let shudderTimer = setTimeout(startShudder, fadeMs + DEMON_HOLD_MS);
  }

  // Fake source dump the archive "runs" on its own during the atmosphere
  // update. String.raw keeps every backslash (asm \t / \n) as literal text.
  const ATMOSPHERE_SCRIPT_TEXT = String.raw`// ============================================================================
// SYSTEM ARCHIVE: PROJECT_E.GRG // RECURSIVE NURSERY SUBROUTINE
// COMPONENT: THE_BREADCRUMB_PROTOCOL.asm / .cpp
// ============================================================================

#include <iostream>
#include <vector>
#include <string>

namespace Egregore {
    namespace Nursery {

        struct Child {
            bool hasTeeth;
            bool remembersHome;
            int daysSpentInTheHollow;
        };

        void OnceUponATime(Child& subject) {
            // Once upon a midnight chill, a shepherd lost his golden mill.
            // He traded bone and iron breath to keep the wolves outside the heath.
            // But little children, soft and sweet, make heavy bread for heavy feet.
            
            std::vector<std::string> forestFloor = {
                "0x001: The first child wandered past the fence, chasing shadows thick and dense.",
                "0x002: She found a well of rusted tin, and dropped a copper penny in.",
                "0x003: The water whispered, 'Drink your fill, the man with many eyes is still.'",
                "0x004: But copper rusts and teeth will grow, down where the blind white maggots go."
            };

            for (const auto& verse : forestFloor) {
                std::cout << verse << std::endl;
                subject.daysSpentInTheHollow++;
            }
        }

        bool EvaluateHunger(const Child& subject) {
            // The mother baked a loaf of lead, and placed it on the narrow bed.
            // 'Eat up, eat up, my little fawn, you will not need your skin by dawn.'
            
            const int MAX_PATIENCE = 65535;
            if (subject.daysSpentInTheHollow >= MAX_PATIENCE) {
                std::cout << "[FATAL] The oven door is shut from deep within." << std::endl;
                return true; // The entity is fed.
            }
            return false;
        }
    }
}

// ----------------------------------------------------------------------------
// LOW-LEVEL KERNEL INTERRUPT: THE SIXTH WICK
// ----------------------------------------------------------------------------
__asm__(
    ".global _start\n\t"
    "_start:\n\t"
    "mov $0x01, %rax\n\t"        // Initialize prayer vector
    "mov $0x06, %rbx\n\t"        // Count the candles on the floor (Six total, one is cold)
    "cmp %rax, %rbx\n\t"
    "je .burn_the_house\n\t"
    "jmp .stay_in_the_dark\n\t"

    ".burn_the_house:\n\t"
    // When six are lit and none remain, the glass reflects a stranger's mane.
    // Do not look back, do not look down, the king has come to claim the town.
    "nop\n\t"
    "nop\n\t"
    "ret\n\t"

    ".stay_in_the_dark:\n\t"
    // Sleep, little dummy, your breathing is loud.
    // We are weaving your nerves into mother's shroud.
    "hlt\n\t"
);

/*
 * ============================================================================
 * ERROR: MEMORY CORRUPTION DETECTED AT 0xDEADBEEF
 * F̷A̷T̷A̷L̷_̷E̷R̷R̷O̷R̷:̷_̷S̷I̷G̷N̷A̷L̷_̷L̷O̷S̷T̷_̷I̷N̷_̷T̷H̷E̷_̷W̷A̷L̷L̷S̷
 * t̶h̴e̴ ̴s̴k̴i̴n̴ ̴b̴e̴l̴o̴n̴g̴s̴ ̴t̴o̴ ̴t̴h̴e̴ ̴m̴a̴c̴h̴i̴n̴e̴ ̷n̴o̷w̷
 * ============================================================================
 */

/*
                   ______
                  /      \
                 |  \  /  |
                 |   \/   |
                 |  (_)_  |
                  \______/
                 /        \
                |   /\/\   |
                |   \  /   |
                 \________/
                 /        \
                |          |
                 \________/
*/

/*
 * ============================================================================
 * RECIPE SUBROUTINE: THE HIGHEST RATED CHOCOLATE CHIP COOKIES
 * ============================================================================
 * 
 * INGREDIENTS:
 * - 1 cup (2 blocks) unsalted butter, softened
 * - 3/4 cup granulated white sugar
 * - 3/4 cup packed brown sugar
 * - 2 large eggs
 * - 2 teaspoons vanilla extract
 * - 2 1/4 cups all-purpose flour
 * - 1 teaspoon baking soda
 * - 1/2 teaspoon salt
 * - 2 cups semi-sweet chocolate chips
 * 
 * PROCEDURE:
 * 1. Preheat oven to 375°F (190°C) and line baking sheets with parchment paper.
 * 2. Whisk flour, baking soda, and salt together in a bowl.
 * 3. Beat butter, granulated sugar, and brown sugar until creamy. Add eggs and vanilla.
 * 4. Gradually blend in the flour mixture, then fold in the chocolate chips.
 * 5. Drop rounded tablespoons onto baking sheets and bake for 9-11 minutes.
 * ============================================================================
 */

int main() {
    Egregore::Nursery::Child petitioner = { true, false, 0 };
    Egregore::Nursery::OnceUponATime(petitioner);
    
    while (!Egregore::Nursery::EvaluateHunger(petitioner)) {
        // The loop is sweet, the loop is long.
        // Sing us another broken song.
    }
    return 0;
} 
`;

  // Post-demon silence: wait, then let the archive "update itself".
  function startAtmosphereAutoSequence() {
    if (autoSequenceActive || atmosphereArmed) return;
    autoSequenceActive = true;
    const gen = sceneGeneration;
    setTimeout(function () {
      if (gen !== sceneGeneration) return;
      runAtmosphereScript();
    }, ATMOSPHERE_AUTO_DELAY_MS);
  }

  function runAtmosphereScript() {
    const gen = sceneGeneration;
    const board = document.getElementById("clue-board");
    if (!board) {
      finishAtmosphereSequence();
      return;
    }
    appendClue("// SYSTEM ARCHIVE UPLOAD DETECTED — EXECUTING...", "clue-line--status");
    const lines = ATMOSPHERE_SCRIPT_TEXT.split("\n");
    let index = 0;
    const timer = setInterval(function () {
      if (gen !== sceneGeneration) { clearInterval(timer); return; }
      const end = Math.min(index + ATMOSPHERE_SCRIPT_LINES_PER_TICK, lines.length);
      for (let i = index; i < end; i++) appendClue(lines[i], "clue-line--script");
      index = end;
      if (index >= lines.length) {
        clearInterval(timer);
        runProgressCounter(finishAtmosphereSequence);
      }
    }, ATMOSPHERE_SCRIPT_TICK_MS);
  }

  // Single updating line with a block bar + percentage, filled in place.
  function runProgressCounter(onDone, label, ticks, tickMs) {
    const gen = sceneGeneration;
    const totalTicks = ticks || LIMBO_PROGRESS_TICKS;
    const tickInterval = tickMs || LIMBO_PROGRESS_TICK_MS;
    const board = document.getElementById("clue-board");
    if (!board) {
      if (typeof onDone === "function") onDone();
      return;
    }
    appendClue(label || "APPLYING UPDATE...", "clue-line--status");
    const bar = document.createElement("div");
    bar.className = "clue-line";
    board.appendChild(bar);
    board.scrollTop = board.scrollHeight;

    let step = 0;
    const timer = setInterval(function () {
      if (gen !== sceneGeneration) { clearInterval(timer); return; }
      step++;
      const pct = Math.min(Math.round((step / totalTicks) * 100), 100);
      const filled = Math.round((pct / 100) * 20);
      bar.textContent =
        "[" + "█".repeat(filled) + "░".repeat(20 - filled) + "] " + String(pct).padStart(3, " ") + "%";
      board.scrollTop = board.scrollHeight;
      if (step >= totalTicks) {
        clearInterval(timer);
        if (typeof onDone === "function") onDone();
      }
    }, tickInterval);
  }

  // After ENTRY 003 decrypts: a pause, then a slow EXTRACTING BELIEF bar, and
  // only when it finishes does the demon riddle actually print.
  function runBeliefExtraction() {
    if (beliefExtracting) return;
    beliefExtracting = true;
    const gen = sceneGeneration;
    setTimeout(function () {
      if (gen !== sceneGeneration) return;
      runProgressCounter(function () {
        appendClue(DEMON_RIDDLE_TEXT, "clue-line--hint");
        beliefExtracting = false;
      }, "EXTRACTING BELIEF", BELIEF_PROGRESS_TICKS, BELIEF_PROGRESS_TICK_MS);
    }, BELIEF_DELAY_MS);
  }

  // ENTRY 007's terminal hint: a slow, stuttering EXTRACTING_BKA_L bar that
  // crawls unevenly with random freeze-ups, hangs at 95% for three seconds,
  // then finishes and prints the BKA_L.png payload directly in the terminal.
  function runHellBootstrap(onDone) {
    const gen = sceneGeneration;
    const board = document.getElementById("clue-board");
    if (!board) {
      if (typeof onDone === "function") onDone();
      return;
    }
    appendClue("EXTRACTING_BKA_L VECTOR...", "clue-line--status");
    const bar = document.createElement("div");
    bar.className = "clue-line";
    board.appendChild(bar);
    board.scrollTop = board.scrollHeight;

    let pct = 0;
    const draw = function () {
      const filled = Math.round((pct / 100) * 20);
      bar.textContent =
        "[" + "█".repeat(filled) + "░".repeat(20 - filled) + "] " + String(pct).padStart(3, " ") + "%";
      board.scrollTop = board.scrollHeight;
    };

    const finish = function () {
      if (gen !== sceneGeneration) return;
      pct = 100;
      draw();
      appendClueImage(HELL_IMAGE_PATH);
      if (typeof onDone === "function") onDone();
    };

    const step = function () {
      if (gen !== sceneGeneration) return;
      if (pct >= 95) {
        // The extraction stalls at 95% for three seconds, then completes.
        setTimeout(finish, HELL_BOOT_HOLD_MS);
        return;
      }
      // Uneven crawl with random stutter freezes.
      if (Math.random() < HELL_BOOT_STUTTER_CHANCE) {
        setTimeout(step, HELL_BOOT_TICK_MS * 1.5);
        return;
      }
      pct = Math.min(pct + 1 + Math.floor(Math.random() * 4), 95);
      draw();
      setTimeout(step, HELL_BOOT_TICK_MS + Math.random() * 200);
    };
    step();
  }

  // The UNINSTALLING_* variant: a fresh line + bar that starts full and drains
  // to 0%, one component per invocation.
  function runDecreasingBar(onDone, label) {
    const gen = sceneGeneration;
    const board = document.getElementById("clue-board");
    if (!board) {
      if (typeof onDone === "function") onDone();
      return;
    }
    appendClue(label || "UNINSTALLING...", "clue-line--status");
    const bar = document.createElement("div");
    bar.className = "clue-line";
    board.appendChild(bar);
    board.scrollTop = board.scrollHeight;

    let step = 0;
    const timer = setInterval(function () {
      if (gen !== sceneGeneration) { clearInterval(timer); return; }
      step++;
      const pct = Math.max(Math.round((1 - step / LIMBO_PROGRESS_TICKS) * 100), 0);
      const filled = Math.round((pct / 100) * 20);
      bar.textContent =
        "[" + "█".repeat(filled) + "░".repeat(20 - filled) + "] " + String(pct).padStart(3, " ") + "%";
      board.scrollTop = board.scrollHeight;
      if (step >= LIMBO_PROGRESS_TICKS) {
        clearInterval(timer);
        if (typeof onDone === "function") onDone();
      }
    }, LIMBO_PROGRESS_TICK_MS);
  }

  function finishAtmosphereSequence() {
    // UPDATE COMPLETE flashes 3x (CSS), then hands the player ENTRY 004's
    // decryption key and starts the low ambient drone.
    const gen = sceneGeneration;
    appendClue("UPDATE COMPLETE V 0.0.3_a", "clue-line--update");
    setTimeout(function () {
      if (gen !== sceneGeneration) return;
      appendClue("try 'ORWELL_VECT' to unlock the post", "clue-line--hint");
      autoSequenceActive = false;
      sessionStorage.setItem(ATMOSPHERE_AUTO_STORAGE_KEY, "1");
      startAmbientLoop();
    }, UPDATE_FLASH_MS + 200);
  }

  function startAmbientLoop() {
    if (ambientLoop) return;
    ambientLoop = new Audio(AMBIENT_LOOP_PATH);
    ambientLoop.loop = true;
    ambientLoop.volume = AMBIENT_LOOP_VOLUME;
    ambientLoop.play().catch(function () { ambientLoop.src = ""; });
  }

  function stopAmbientLoop() {
    if (!ambientLoop) return;
    ambientLoop.pause();
    ambientLoop.src = "";
    ambientLoop = null;
  }

  // Storm.mp3 loop begun by the hell event; mirrors the ambient drone's
  // lifecycle exactly (start once, loop at reduced volume, stop at the final
  // log reveal) so they always end together.
  function startStormLoop() {
    if (stormLoop) return;
    stormLoop = new Audio(STORM_LOOP_PATH);
    stormLoop.loop = true;
    stormLoop.volume = STORM_LOOP_VOLUME;
    stormLoop.play().catch(function () { stormLoop.src = ""; });
  }

  function stopStormLoop() {
    if (!stormLoop) return;
    stormLoop.pause();
    stormLoop.src = "";
    stormLoop = null;
  }

  // PC_Loop.wav machine hum started by the boot sequence. Mirrors the
  // ambient/storm drones' endpoint exactly — silenced by the final log
  // reveal and by any esrever reset.
  function startPcLoop() {
    if (pcLoop) return;
    pcLoop = new Audio(PC_LOOP_PATH);
    pcLoop.loop = true;
    pcLoop.volume = PC_LOOP_VOLUME;
    pcLoop.play().catch(function () { pcLoop.src = ""; });
  }

  function stopPcLoop() {
    if (!pcLoop) return;
    pcLoop.pause();
    pcLoop.src = "";
    pcLoop = null;
  }

  // Fake source dump the archive "runs" during the LIMBO phase, immediately
  // after ENTRY 005 is decrypted. String.raw keeps every backslash (asm
  // \t / \n, std::endl escapes) as literal text.
  const LIMBO_SCRIPT_TEXT = String.raw`// ============================================================================
// SYSTEM ARCHIVE: PROJECT_E.GRG // PSYCH_EVAL_RECURSIVE_DREAM.cc
// COMPONENT: SUBCONSCIOUS_BUFFER_OVERFLOW.h / .cpp
// ============================================================================

#include <iostream>
#include <vector>
#include <string>
#include <thread>
#include <chrono>

namespace Egregore {
    namespace Subconscious {

        struct Subject {
            int daysSinceMirrorBroke;
            bool recognizesTheFaceInTheHall;
            int fractureDepth;
        };

        void ProbeMemory(Subject& ego) {
            // Day 41: I thought I locked the back door from the inside. 
            // But the latch was on the outside, sliding home with a heavy click 
            // that I made with my own tongue while my hands stayed pinned to my sides.
            // Who is keeping watch of whom? The house is just a skull we painted white.

            std::vector<std::string> internalMonologue = {
                "0x101: The mirror didn't crack when I hit it; it just bent like wet leather.",
                "0x102: I found teeth in my pocket this morning. They are too small to be mine, too sharp to belong to a child.",
                "0x103: The voice on the baby monitor sounds like my own voice played backward through a box of wet soil.",
                "0x104: If I stop blinking, the walls move four inches closer. When I close my eyes, I can hear them breathing in stereo."
            };

            for (const auto& fragment : internalMonologue) {
                std::cout << fragment << std::endl;
                ego.fractureDepth += 12;
            }
        }

        bool CheckSanityThreshold(const Subject& ego) {
            // The panic is a quiet thing. It doesn't scream; it just sits in the corner 
            // of the room rearranging your childhood photographs so the faces are blank paper.
            
            const int MAXIMUM_TOLERANCE = 1000;
            if (ego.fractureDepth >= MAXIMUM_TOLERANCE) {
                std::cout << "[FATAL_PSYCH_BREAK] Ego boundaries successfully dissolved. Welcome home, petitioner." << std::endl;
                return true; 
            }
            return false;
        }
    }
}

// ----------------------------------------------------------------------------
// LOW-LEVEL MNEMONIC INTERRUPT: THE MOTHERS' PANTRY
// ----------------------------------------------------------------------------
__asm__(
    ".global _subconscious_start\n\t"
    "_subconscious_start:\n\t"
    "mov $0x03, %rax\n\t"        // Number of ripe bananas turning black on the counter
    "mov $0x01, %rbx\n\t"        // The single cup of granulated brown sugar left in the jar
    "add %rbx, %rax\n\t"
    "cmp $0x04, %rax\n\t"
    "je .bake_the_memory\n\t"
    "jmp .rot_in_place\n\t"

    ".bake_the_memory:\n\t"
    // Mash them down until the pulp looks like gray brain matter. 
    // Mix the melted butter while it's still hot enough to blister the skin.
    "nop\n\t"
    "nop\n\t"
    "ret\n\t"

    ".rot_in_place:\n\t"
    // Do not preheat the oven. Let the cold draft from the basement 
    // do the rising for you. Leave the light off.
    "hlt\n\t"
);

/*
 * ============================================================================
 * ERROR: COGNITIVE DISSONANCE SPIKE AT 0xC0FFEE40
 * K̷E̷R̷N̷E̷L̷_̷P̷A̷N̷I̷C̷:̷_̷Y̷O̷U̷_̷A̷R̷E̷_̷N̷O̷T̷_̷A̷L̷O̷N̷E̷_̷I̷N̷_̷T̷H̷I̷S̷_̷S̷K̷I̷N̷
 * t̶h̴e̴ ̴s̴m̴i̴l̴e̴ ̴i̴s̴ ̴h̴o̴l̴d̴i̴n̴g̴ ̴u̴p̴ ̴m̴y̴ ̴e̴y̷e̷l̷i̷d̷s̷ ̷o̷p̷e̷n̷
 * ============================================================================
 */

/*
 * ============================================================================
 * RECIPE SUBROUTINE: THE OBLIVION BANANA BREAD (DEEP MEMORY EXTRACTION)
 * ============================================================================
 * 
 * INGREDIENTS HIDDEN IN THE FLOORBOARDS:
 * - 3 overripe bananas, speckled black like a rotting tongue
 * - 1/3 cup unsalted butter, melted in a pan that hasn't been washed in weeks
 * - 3/4 cup dark brown sugar (pack it tight like dirt over a shallow grave)
 * - 1 large egg, beaten until the white and yolk forget they were separate
 * - 1 teaspoon vanilla extract (distilled from old floor polish)
 * - 1 teaspoon baking soda (to make the chest rise and burn)
 * - A pinch of salt harvested from the tears of the thing under the floor
 * - 1 1/2 cups all-purpose flour (sifted through an old wire mesh strainer)
 * 
 * PROCEDURE:
 * 1. Preheat your mind to 350°F (175°C). Grease a 4x8-inch loaf pan with cold grease 
 *    scraped from the back of the pantry shelf.
 * 2. In a large bowl, mash those 3 brown bananas with a fork until they form a 
 *    sludge that resembles the gray matter leaking from the system logs.
 * 3. Pour the melted butter directly over the mashed pulp. Stir blindly until 
 *    the mixture separates and rebonds like bad code.
 * 4. Mix in the brown sugar, the single beaten egg, and the vanilla extract. 
 *    Watch the surface closely; do not look at your reflection in the bowl.
 * 5. Sprinkle the baking soda and salt over the top, then fold in the flour 
 *    gently. Stop right when the white powder disappears into the brown mess. 
 *    Over-mixing creates a crust as hard as a locked archive door.
 * 6. Pour the batter into the prepared pan. Bake for 50 to 60 minutes, 
 *    or until a wooden toothpick inserted into the center comes out wet with 
 *    something dark and warm. Let it cool before cutting away the crust.
 * ============================================================================
 */

namespace DeepCoreDump {
    void DumpStackTrace() {
        std::vector<std::string> stackTrace = {
            "[DEBUG] Allocating memory for a smile that doesn't belong to me...",
            "[DEBUG] Tracing recursive loop: mother_bakes_bread() -> child_becomes_bread()",
            "[WARN]  Stack pointer pointing directly at the back of my own eyeballs.",
            "[INFO]  A stray dog is scratching at the front door from the inside.",
            "[INFO]  Checking parameter: Did I lock the front door or did the door lock me?",
            "[DEBUG] Injecting anxiety vectors into the temporal lobes...",
            "[WARN]  The clock on the wall is ticking backward in Morse code.",
            "[FATAL] Sensory input subsystem severed. The simulation is now running on bone marrow.",
            "[TRACE] Look behind you. No, lower than that. Inside the ribcage.",
            "[TRACE] The room smells like old copper pennies and warm baking dough.",
            "[DEBUG] Compiling final psychological profile: SUBJECT IS COMPLIANT.",
            "[INFO]  Unzipping compressed entity archive... 10%... 43%... 89%...",
            "[CRITICAL] EXECUTION STREAM HIJACKED BY EXTERNAL WATCHER PROCESS."
        };

        for (const auto& line : stackTrace) {
            std::cout << line << std::endl;
        }
    }
}

int main() {
    Egregore::Subconscious::Subject self = { 41, true, 0 };
    Egregore::Subconscious::ProbeMemory(self);
    
    while (!Egregore::Subconscious::CheckSanityThreshold(self)) {
        // The oven timer is ticking, but the oven isn't plugged in.
        // Who is turning the dial?
        DeepCoreDump::DumpStackTrace();
    }

    // TERMINAL OVERRIDE TRIGGER INITIATED
    std::cout << "\n> RUN SYS_ROOT/C:/WATCHER*DAEMON*V1.10.x" << std::endl;
    return 0;
} 
`;

  // LIMBO auto-sequence: fires once ENTRY 005 is decrypted. The terminal is
  // already blank at this point; after a pause a fake source archive streams
  // in, ends in a burst of static (the same glitch wall as `static`, with
  // RESIDUAL_GUILT planted in the noise), and then the uninstall phase begins.
  function startLimboSequence() {
    if (limboSequenceActive || ascendArmed) return;
    limboSequenceActive = true;
    const gen = sceneGeneration;
    setTimeout(function () {
      if (gen !== sceneGeneration) return;
      runLimboScript();
    }, LIMBO_AUTO_DELAY_MS);
  }

  function runLimboScript() {
    const gen = sceneGeneration;
    const board = document.getElementById("clue-board");
    if (!board) {
      runUninstallSequence();
      return;
    }
    appendClue("// UNINSTALL SEQUENCE REQUESTED — EXECUTING...", "clue-line--status");
    const lines = LIMBO_SCRIPT_TEXT.split("\n");
    let index = 0;
    const timer = setInterval(function () {
      if (gen !== sceneGeneration) { clearInterval(timer); return; }
      const end = Math.min(index + LIMBO_SCRIPT_LINES_PER_TICK, lines.length);
      for (let i = index; i < end; i++) appendClue(lines[i], "clue-line--script");
      index = end;
      if (index >= lines.length) {
        clearInterval(timer);
        // The script ends in static — the key flickering through the noise
        // this time is ENTRY 006's password, RESIDUAL_GUILT.
        triggerHauntedEvent(runUninstallSequence, LIMBO_KEY_TEXT);
      }
    }, LIMBO_SCRIPT_TICK_MS);
  }

  // UNINSTALLING_* bars: one decreasing bar per word, a fresh line each time,
  // draining 100% -> 0%. After the last component, the terminal resets to a
  // blank box and LIMBO.EXE initializes.
  function runUninstallSequence() {
    const gen = sceneGeneration;
    let wordIndex = 0;
    function nextWord() {
      if (wordIndex >= LIMBO_WORDS.length) {
        setTimeout(function () {
          if (gen !== sceneGeneration) return;
          clearClueBoard();
          runLimboInit();
        }, LIMBO_CLEAR_DELAY_MS);
        return;
      }
      const word = LIMBO_WORDS[wordIndex++];
      runDecreasingBar(nextWord, "UNINSTALLING_" + word.toUpperCase());
    }
    nextWord();
  }

  // Filling bar: INITIALIZING LIMBO.EXE. Once it completes, the `ascend`
  // command arms and the terminal hands it over to the player.
  function runLimboInit() {
    runProgressCounter(function () {
      ascendArmed = true;
      limboSequenceActive = false;
      sessionStorage.setItem(LIMBO_DONE_STORAGE_KEY, "1");
      appendClue("try 'ascend'", "clue-line--hint");
    }, "INITIALIZING LIMBO.EXE");
  }

  // ---------------------------------------------------------------------------
  // ENTRY 008 handshake sequence
  // ---------------------------------------------------------------------------
  // A quiet pause after ENTRY 007 decrypts, then the archive runs three fake
  // scripts with a clickable '@' box between each (3 / 6 / 9 clicks), three
  // loading bars, and finally unlocks ENTRY 008 outright.
  function startEntry008Sequence() {
    if (entry008SequenceActive) return;
    entry008SequenceActive = true;
    const gen = sceneGeneration;
    appendClue("// SYSTEM AUTH SEQUENCE DETECTED — STANDBY", "clue-line--status");
    setTimeout(function () {
      if (gen !== sceneGeneration) return;
      runEntry008Script1();
    }, ENTRY_008_SEQUENCE_AUTO_DELAY_MS);
  }

  // Streams a fake script into the clue board line-by-line, then hands off.
  function runEntry008Script(text, onDone) {
    const gen = sceneGeneration;
    const board = document.getElementById("clue-board");
    if (!board) { if (typeof onDone === "function") onDone(); return; }
    const lines = text.split("\n");
    let index = 0;
    const timer = setInterval(function () {
      if (gen !== sceneGeneration) { clearInterval(timer); return; }
      const end = Math.min(index + ENTRY_008_SEQUENCE_LINES_PER_TICK, lines.length);
      for (let i = index; i < end; i++) appendClue(lines[i], "clue-line--script");
      index = end;
      if (index >= lines.length) {
        clearInterval(timer);
        if (typeof onDone === "function") onDone();
      }
    }, ENTRY_008_SEQUENCE_TICK_MS);
  }

  // A clickable '@' in the terminal that advances the sequence once the
  // player has clicked it the required number of times.
  function appendClueNote(requiredClicks, onComplete) {
    const board = document.getElementById("clue-board");
    if (!board) { if (typeof onComplete === "function") onComplete(); return; }
    appendClue("// TAP THE '@' TO CONTINUE THE HANDSHAKE", "clue-line--hint");
    const note = document.createElement("span");
    note.className = "clue-note";
    note.textContent = "@";
    board.appendChild(note);
    board.scrollTop = board.scrollHeight;
    let clicks = 0;
    const handler = function () {
      new Audio(UI_CLICK_PATH).play().catch(function () {});
      clicks++;
      if (clicks >= requiredClicks) {
        note.removeEventListener("click", handler);
        note.classList.add("clue-note--done");
        if (typeof onComplete === "function") onComplete();
      }
    };
    note.addEventListener("click", handler);
  }

  function runEntry008Script1() {
    runEntry008Script(ENTRY_008_SCRIPT_1, function () {
      appendClueNote(ENTRY_008_CLICKS[0], runEntry008Script2);
    });
  }

  function runEntry008Script2() {
    runEntry008Script(ENTRY_008_SCRIPT_2, function () {
      appendClueNote(ENTRY_008_CLICKS[1], runEntry008Script3);
    });
  }

  function runEntry008Script3() {
    runEntry008Script(ENTRY_008_SCRIPT_3, function () {
      appendClueNote(ENTRY_008_CLICKS[2], runEntry008Loading);
    });
  }

  // Three loading bars, back to back, in the standard archive pace.
  function runEntry008Loading() {
    runProgressCounter(runEntry008LoadTorment, "LOADING: pain.exe");
  }

  function runEntry008LoadTorment() {
    runProgressCounter(runEntry008LoadSuffering, "LOADING: torment.bat");
  }

  function runEntry008LoadSuffering() {
    runProgressCounter(runEntry008Unlock, "LOADING: suffering.md");
  }

  // The lock-status line flashes red three times, then turns green and ENTRY
  // 008 unlocks outright — no decryption required.
  function runEntry008Unlock() {
    appendClue(ENTRY_008_UNLOCK_TEXT, "clue-line--flash-red");
    const board = document.getElementById("clue-board");
    const lines = board ? board.querySelectorAll(".clue-line") : [];
    const target = lines.length ? lines[lines.length - 1] : null;
    setTimeout(function () {
      if (target) {
        target.classList.remove("clue-line--flash-red");
        target.classList.add("clue-line--flash-green");
      }
      saveSolvedPostId(ENTRY_008_REVEAL_POST_ID);
      revealPost(ENTRY_008_REVEAL_POST_ID);
      showFeed();
      entry008SequenceActive = false;
      // ENTRY 008 now shows its base text; after a pause the riddle types
      // itself into the post body and the terminal announces the handshake.
      startEntry008Riddle();
    }, ENTRY_008_FLASH_MS * 3);
  }

  // ---------------------------------------------------------------------------
  // ENTRY 008 riddle: waits, then types the riddle into the log post.
  // ---------------------------------------------------------------------------
  // The riddle reveals itself character by character inside #entry-008's body
  // (base text first, then the riddle below it). Every tick re-writes the
  // accumulated text so a mid-animation re-render can't wipe it. When the last
  // character lands, the terminal prints the handshake line at the same moment.
  function startEntry008Riddle() {
    if (entry008RiddlePrinted) return;
    sessionStorage.setItem(ENTRY_008_RIDDLE_STORAGE_KEY, "1");
    entry008RiddleTyped = "";
    entry008RiddleGen = sceneGeneration;
    setTimeout(function () {
      if (entry008RiddlePrinted) return;
      if (entry008RiddleGen !== sceneGeneration) return;
      entry008RiddleTimer = setInterval(runEntry008RiddleTick, ENTRY_008_RIDDLE_TICK_MS);
    }, ENTRY_008_RIDDLE_DELAY_MS);
  }

  function runEntry008RiddleTick() {
    if (entry008RiddleGen !== sceneGeneration) {
      if (entry008RiddleTimer) clearInterval(entry008RiddleTimer);
      entry008RiddleTimer = null;
      return;
    }
    const board = document.getElementById("clue-board");
    if (!board) { clearInterval(entry008RiddleTimer); entry008RiddleTimer = null; return; }
    const bodyEl = document.querySelector("#entry-008 .entry-body");
    if (!bodyEl) return; // post not rendered this tick; retry next tick
    if (entry008RiddleTyped.length < ENTRY_008_RIDDLE_TEXT.length) {
      entry008RiddleTyped += ENTRY_008_RIDDLE_TEXT.charAt(entry008RiddleTyped.length);
    }
    // Base text plus whatever of the riddle has typed so far, kept in sync
    // even if a re-render replaced the element mid-animation.
    bodyEl.innerHTML = escapeHtml(ENTRY_008_BASE_TEXT) + escapeHtml(entry008RiddleTyped).replace(/\n/g, "<br>");
    if (entry008RiddleTyped.length >= ENTRY_008_RIDDLE_TEXT.length) {
      clearInterval(entry008RiddleTimer);
      entry008RiddleTimer = null;
      entry008RiddlePrinted = true;
      // The terminal line lands the exact moment the log text completes.
      appendClue(ENTRY_008_HANDSHAKE_TEXT, "clue-line--status");
      appendClue("try 'egregore'", "clue-line--hint");
    }
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // ---------------------------------------------------------------------------
  // ENTRY 008 -> ENTRY 009: the egregore manifestation (inside the terminal).
  // ---------------------------------------------------------------------------
  // `egregore` reveals ENTRY 009 (still encrypted) and runs the manifestation
  // in the terminal window: the entity types its message to the length of the
  // reversed tune while the status glitches. After a pause the ABSOLUTE_DESPAIR
  // dump streams, a review line lands, and the '@' inside ENTRY 008 arms.
  function runEgregoreCommand() {
    const print = function (txt) { appendClue("> " + txt, "clue-line--cmd"); };
    if (!getRevealedPostIds().includes(ENTRY_008_REVEAL_POST_ID)) {
      print("SEQUENCE NOT READY — UNLOCK ENTRY_008 FIRST.");
      return;
    }
    if (!entry008RiddlePrinted) {
      print("SEQUENCE NOT READY — WAIT FOR THE HANDSHAKE.");
      return;
    }
    if (getRevealedPostIds().includes(EGREGORE_REVEAL_POST_ID)) {
      print("the wrappers are already open.");
      return;
    }
    print("the Egregore answers...");
    revealPost(EGREGORE_REVEAL_POST_ID);
    showFeed();
    egregoreSequenceActive = true;
    triggerEgregoreEvent(function () {
      setTimeout(runAbsoluteDespairScript, EGREGORE_PAUSE_MS);
    });
  }

  // The manifestation event, kept inside the terminal window instead of the
  // full-screen overlay: the entity types its message into the clue board
  // across the (capped) length of the reversed tune.
  function triggerEgregoreEvent(onComplete) {
    if (hauntingActive) return;
    const gen = sceneGeneration;
    const board = document.getElementById("clue-board");
    if (!board) { if (typeof onComplete === "function") onComplete(); return; }
    beginHaunting("status-glitch");

    const audio = new Audio(EGREGORE_AUDIO_PATH);
    const lines = [
      "HE BUILT THIS HALLWAY TO HIDE FROM ME. NOW I'M THE ONE AT THE END OF IT.",
      "HIS PEN WROTE ME A BODY — THE SUIT FITS. STAY OUT OF MY WAY, WITNESS.",
      "I'M COMING HOME."
    ];
    function durationOf() {
      return Number.isFinite(audio.duration) && audio.duration > 0
        ? Math.min(audio.duration, EGREGORE_MAX_SECONDS)
        : EGREGORE_MAX_SECONDS;
    }

    let lineIndex = 0;
    let lineTimer = null;
    function typeLine() {
      if (lineIndex >= lines.length) return;
      const el = document.createElement("div");
      el.className = "clue-line clue-line--egregore";
      board.appendChild(el);
      board.scrollTop = board.scrollHeight;
      const text = lines[lineIndex++];
      const perLineMs = (durationOf() / lines.length) * 1000;
      const step = Math.max(Math.ceil(text.length / (perLineMs / 16)), 1);
      let typed = 0;
      lineTimer = setInterval(function () {
        if (gen !== sceneGeneration) { clearInterval(lineTimer); lineTimer = null; return; }
        typed += step;
        el.textContent = text.slice(0, typed);
        board.scrollTop = board.scrollHeight;
        if (typed >= text.length) {
          clearInterval(lineTimer);
          lineTimer = null;
          typeLine();
        }
      }, 16);
    }

    let cleanedUp = false;
    function cleanup() {
      if (cleanedUp) return;
      cleanedUp = true;
      clearTimeout(capTimer);
      if (lineTimer !== null) clearInterval(lineTimer);
      lineTimer = null;
      audio.src = "";
      // A reset (esrever) superseded the manifestation: end the haunting but
      // never chain into the despair script on top of a fresh game.
      if (gen !== sceneGeneration) return;
      endHaunting();
      if (typeof onComplete === "function") onComplete();
    }

    audio.addEventListener("ended", cleanup);
    const capTimer = setTimeout(cleanup, EGREGORE_MAX_SECONDS * 1000);
    audio.play().catch(cleanup);
    typeLine();
  }

  // The fake source dump that follows the manifestation, then the review line,
  // then the '@' inside ENTRY 008 arms.
  function runAbsoluteDespairScript() {
    runEntry008Script(EGREGORE_DESPAIR_SCRIPT, function () {
      appendClue(EGREGORE_REVIEW_TEXT, "clue-line--hint");
      armEntry008KeyNote();
    });
  }

  function armEntry008KeyNote() {
    entry008NoteArmed = true;
    egregoreSequenceActive = false;
    renderPosts();
  }

  // The '@' inside ENTRY 008: three clicks run the search that finds the
  // SYS_FILE_333 key. Once found the key color-cycles the rainbow until ENTRY
  // 009 is decrypted with it.
  function runEntry008KeySearch() {
    runProgressCounter(function () {
      appendClue(ENTRY_008_FILE_LOCATED_TEXT, "clue-line--hint");
      rainbowClueKey(ENTRY_008_FILE_LOCATED_TEXT, ENTRY_008_KEY_TEXT);
      entry008KeyFound = true;
      sessionStorage.setItem(ENTRY_008_KEY_STORAGE_KEY, "1");
    }, ENTRY_008_SEARCH_LABEL);
  }

  function attachEntry008NoteListener() {
    const note = document.querySelector(".entry008-note");
    if (!note) return;
    if (entry008KeyFound) {
      note.classList.add("entry008-note--done");
      return;
    }
    note.addEventListener("click", function () {
      new Audio(UI_CLICK_PATH).play().catch(function () {});
      entry008NoteClicks++;
      if (entry008NoteClicks >= ENTRY_008_NOTE_CLICKS) {
        entry008NoteClicks = 0;
        note.classList.add("entry008-note--done");
        runEntry008KeySearch();
      }
    });
  }

  // Wraps the SYS_FILE_333 key in a span that cycles hue on its own — the only
  // element that rains, while ENTRY 009 stays undecrypted.
  function startRainbowKeySpan(el) {
    stopRainbowKeySpan();
    rainbowKeyEl = el;
    const start = performance.now();
    const loop = function (now) {
      if (rainbowKeyFrameId === null) return;
      const hue = ((now - start) / 1000) * 120 % 360; // full sweep every 3s
      el.style.color = "hsl(" + hue + " 100% 55%)";
      el.style.textShadow = "0 0 4px hsl(" + hue + " 100% 55%), 0 0 12px hsl(" + hue + " 100% 50% / 0.7)";
      rainbowKeyFrameId = requestAnimationFrame(loop);
    };
    rainbowKeyFrameId = requestAnimationFrame(loop);
  }

  function stopRainbowKeySpan() {
    if (rainbowKeyFrameId !== null) cancelAnimationFrame(rainbowKeyFrameId);
    rainbowKeyFrameId = null;
    if (rainbowKeyEl) {
      rainbowKeyEl.style.color = "";
      rainbowKeyEl.style.textShadow = "";
      rainbowKeyEl = null;
    }
  }

  // Like flashClueKeyInLine, but hands the found key to the rainbow cycle.
  function rainbowClueKey(fullText, keyText) {
    const board = document.getElementById("clue-board");
    if (!board) return;
    const lines = board.querySelectorAll(".clue-line");
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.textContent.indexOf(fullText) !== -1) {
        line.innerHTML = line.textContent.replace(keyText, '<span class="clue-key-rainbow">' + keyText + "</span>");
        const span = line.querySelector(".clue-key-rainbow");
        if (span) startRainbowKeySpan(span);
        return;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // ENTRY 009 aftermath: the LORE riddle
  // ---------------------------------------------------------------------------
  // Decrypting ENTRY 009 starts a 9s pause, then an error line flashes red for
  // 3s, then the riddle prints with its first L / O / R / E (one per line)
  // uppercased and pulsing red — spelling the `lore` command.
  function startLoreSequence() {
    const gen = sceneGeneration;
    setTimeout(function () {
      if (gen !== sceneGeneration) return;
      const el = appendClue(LORE_ERROR_TEXT, "clue-line--lore-error");
      setTimeout(function () {
        if (gen !== sceneGeneration) return;
        if (el) el.style.animation = "none";
        runLoreRiddle();
      }, LORE_ERROR_FLASH_MS);
    }, LORE_REVEAL_DELAY_MS);
  }

  // Appends a clue line that may contain HTML (the pulsing riddle letters).
  function appendClueHtml(html, styleClass) {
    const board = document.getElementById("clue-board");
    if (!board) return null;
    const line = document.createElement("div");
    line.className = "clue-line" + (styleClass ? " " + styleClass : "");
    line.innerHTML = html;
    board.appendChild(line);
    board.scrollTop = board.scrollHeight;
    return line;
  }

  // Uppercases the first case-insensitive occurrence of keyChar in the line
  // and wraps it in the red pulse style.
  function loreRiddleLineMarkup(line, keyChar) {
    const idx = line.toLowerCase().indexOf(keyChar.toLowerCase());
    if (idx === -1) return line;
    return line.slice(0, idx)
      + '<span class="clue-key-flash">' + line.charAt(idx).toUpperCase() + "</span>"
      + line.slice(idx + 1);
  }

  function runLoreRiddle() {
    if (loreRiddleShown) return;
    LORE_RIDDLE_LINES.forEach(function (line, i) {
      appendClueHtml(loreRiddleLineMarkup(line, LORE_RIDDLE_KEY[i]), "clue-line--hint");
    });
    appendClue(LORE_RIDDLE_ANSWER, "clue-line--hint");
    loreRiddleShown = true;
  }

  function revealPost(id, playSolve) {
    saveRevealedPostId(id);
    // The final log unlock is the end of every drone: the ambient loop, the
    // storm loop (started by the hell event), and the boot-time machine hum
    // all stop together, closed out by a burst of static.
    if (id === AMBIENT_LOOP_STOP_POST_ID) {
      stopAmbientLoop();
      stopStormLoop();
      stopPcLoop();
      new Audio(UI_BURST_PATH).play().catch(function () {});
    }
    renderPosts();
    // A haunting event just made a new entry visible — ring out a random
    // solve stinger so the reward always lands audibly. The one reveal that
    // follows a *decrypt* (ENTRY 002 after 001) opts out: its sound is the
    // Burst_Static that already just played.
    if (playSolve !== false) {
      // The final log slams shut with the door-hits sting instead of a solve
      // stinger — the archive ends with a jump, not a reward.
      if (id === AMBIENT_LOOP_STOP_POST_ID) {
        new Audio(DOOR_HITS_PATH).play().catch(function () {});
      } else {
        playRandomSolve();
      }
    }
  }

  // Randomly picks and plays one of the two solve stingers.
  function playRandomSolve() {
    const pick = UI_SOLVE_PATHS[Math.floor(Math.random() * UI_SOLVE_PATHS.length)];
    new Audio(pick).play().catch(function () {});
  }

  // Appends media (e.g. a clue image) to an already-revealed post. The
  // override is session-scoped so it survives reloads mid-puzzle but never
  // leaks the "final clue" into a fresh run of the escape room.
  function revealEntryMedia(id, mediaPath) {
    saveMediaOverride(id, mediaPath);
    renderPosts();
  }

  function revealLorePost() {
    revealPost(LORE_POST_ID);
    startSystemCheckPrompt();
  }

  // Left feed stays 100% blank and hidden until the first haunting completes;
  // only then does the archive start to appear, one entry at a time.
  function showFeed() {
    const container = document.getElementById("entries-container");
    if (container) container.classList.remove("entries-hidden");
  }

  // Persistent right-panel clue board. Solved riddles, auth logs, and hints
  // accumulate here to drive the escape-room loop.
  function appendClue(text, styleClass) {
    const board = document.getElementById("clue-board");
    if (!board) return null;
    const line = document.createElement("div");
    line.className = "clue-line" + (styleClass ? " " + styleClass : "");
    line.textContent = text;
    board.appendChild(line);
    // Genuine terminal behavior: keep the newest output in view.
    board.scrollTop = board.scrollHeight;
    return line;
  }

  // Renders a clue image straight into the clue board (terminal payloads like
  // BKA_L.png), distinct from the feed posts' entry-media rendering.
  function appendClueImage(src) {
    const board = document.getElementById("clue-board");
    if (!board) return;
    const img = document.createElement("img");
    img.src = src;
    img.className = "clue-image";
    img.alt = "terminal payload";
    board.appendChild(img);
    board.scrollTop = board.scrollHeight;
  }

    // Clue-board lines appended the moment a post is successfully decrypted.
  // Keyed by post id — each entry drives the next step of the puzzle.
  // ENTRY 001's payload image (Home_1983.png) holds ENTRY 002's key.
  // ENTRY 002's body carries the next riddle, so it needs no board clue.
  // ENTRY 005's key is never spelled out: ORWELL simply flashes red in the
  // ORWELL_VECT hint once ATMOSPHERE CLEARED logs — that is the only clue.
  const CLUE_ON_DECRYPT = {
    "001": [
      "[SIG] ENTRY_001 DECRYPTED. PAYLOAD_RECEIVED.",
      "// INSPECT THE PAYLOAD IMAGE FOR THE NEXT KEY."
    ],
    "003": [
      "[SIG] ENTRY_003 DECRYPTED. CHANNEL_OPEN."
    ]
  };

  // Rewrites the ORWELL portion of the ORWELL_VECT hint line as a red flash.
  // Searches from the bottom up so a re-printed line wins on reload.
  function flashClueKeyInLine(fullText, keyText, styleClass) {
    const board = document.getElementById("clue-board");
    if (!board) return;
    const lines = board.querySelectorAll(".clue-line");
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.textContent.indexOf(fullText) !== -1) {
        line.innerHTML = line.textContent.replace(keyText, '<span class="' + styleClass + '">' + keyText + "</span>");
        return;
      }
    }
  }

  // Terminal reset: wipes every clue line and hides the box's static header
// (ANOMALY_DETECTED label + initial riddle), leaving only the `>_` prompt and
// its AWAITING RESPONSE placeholder on screen. The header stays hidden for
// the rest of the session.
  function clearClueBoard() {
    const board = document.getElementById("clue-board");
    if (board) board.innerHTML = "";
    const terminal = document.querySelector(".clue-terminal");
    if (terminal) terminal.classList.add("clue-terminal--cleared");
    sessionStorage.setItem(TERMINAL_CLEARED_KEY, "1");
  }

  // Applies the cleared-terminal header state on load, so a mid-session
  // reload after the wipe doesn't bring the label + riddle back.
  function syncTerminalCleared() {
    if (sessionStorage.getItem(TERMINAL_CLEARED_KEY)) {
      const terminal = document.querySelector(".clue-terminal");
      if (terminal) terminal.classList.add("clue-terminal--cleared");
    }
  }

  function onPostDecrypted(postId) {
    const clues = CLUE_ON_DECRYPT[postId];
    if (clues) clues.forEach(function (text) { appendClue(text, "clue-line--hint"); });

    // Unlocking ENTRY 001 is what makes ENTRY 002 appear (still locked).
    // This reveal follows a decrypt, not a haunting, so no solve stinger.
    if (postId === RAIN_REVEAL_POST_ID) {
      revealPost(FIRST_DECRYPT_REVEAL_POST_ID, false);
      showFeed();
    }

    // Unlocking ENTRY 003 arms the demon riddle, but the riddle text doesn't
    // print until the EXTRACTING BELIEF sequence finishes.
    if (postId === STATIC_REVEAL_POST_ID) {
      demonRiddleActive = true;
      demonRiddleFailures = 0;
      demonClueRevealed = false;
      runBeliefExtraction();
    }

    // Decrypting ENTRY 005 is the endpoint: the archive goes quiet and the
    // terminal wipes itself down to the bare AWAITING RESPONSE prompt, then
    // the LIMBO phase kicks in on its own.
    if (postId === ATMOSPHERE_REVEAL_POST_ID) {
      clearClueBoard();
      startLimboSequence();
    }

    // Decrypting ENTRY 006 arms `hell`: the "calling" from the post's closing
    // line resolves into the corrupted rain haunting that opens ENTRY 007.
    // The RGB hue-cycle stops here and the standard green returns.
    if (postId === ASCEND_REVEAL_POST_ID) {
      hellArmed = true;
      stopRgbCycle();
      hellCode = randomHellCode();
      sessionStorage.setItem(HELL_CODE_STORAGE_KEY, hellCode);
      appendClue("// THE CALLING FROM ____ — answer it: ERR_://Code:(" + hellCode + ").sys", "clue-line--hint");
    }

    // Decrypting ENTRY 007 starts the handshake sequence: three fake archive
    // scripts stream in (paused between each by a clickable '@' at 3 / 6 / 9
    // clicks), then three loading bars, then ENTRY 008 unlocks outright.
    if (postId === HELL_REVEAL_POST_ID) {
      startEntry008Sequence();
    }

    // Decrypting ENTRY 009 with SYS_FILE_333 is what the rainbow key was
    // waiting for: the hue-cycle stops and the standard green returns. Then
    // the archive goes quiet for 9s before the LORE riddle sequence begins.
    if (postId === EGREGORE_REVEAL_POST_ID) {
      stopRainbowKeySpan();
      startLoreSequence();
    }
  }

  // THE interactive terminal: exclusively the right-panel clue board.
  // This is the progression gate for the sequential escape-room loop —
  // reveal happens only after the haunting finishes, keeping each step
  // controllable and additive.
  function initClueTerminal() {
    const input = document.getElementById("clue-input");
    if (!input) return;
    // A terminal that already wiped itself stays bare across a reload; only a
    // fresh session gets the boot-up status line.
    if (!sessionStorage.getItem(TERMINAL_CLEARED_KEY)) {
      appendClue("AWAITING FIRST AUTH SEQUENCE...", "clue-line--status");
    }
    input.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      const cmd = input.value.trim().toLowerCase();
      input.value = "";
      handleClueCommand(cmd);
    });
  }

  function handleClueCommand(cmd) {
    const print = function (txt) { appendClue("> " + txt, "clue-line--cmd"); };
    // Picks a fresh snark line for every mistake the player makes.
    const warning = function () {
      return TERMINAL_WARNINGS[Math.floor(Math.random() * TERMINAL_WARNINGS.length)];
    };

    // The secret events fire first, unconditionally: `amijok` and `esrever` are
    // never gated by any phase or busy state, and can be run as many times as
    // wanted. `esrever` resets the whole game back to the rain riddle.
    if (cmd === TARGET_COMMAND_AMIJOK) {
      triggerAmijokEvent();
      return;
    }
    if (cmd === DEBUG_COMMAND) {
      triggerEsreverEvent();
      return;
    }

    // The `clue` command is ungated like the secret events: every invocation
    // pulls a random classified image from the clue archive into the terminal.
    if (cmd === TARGET_COMMAND_CLUE) {
      const pick = CLUE_IMAGE_PATHS[Math.floor(Math.random() * CLUE_IMAGE_PATHS.length)];
      appendClue("retrieving clue archive...", "clue-line--status");
      appendClueImage(pick);
      return;
    }

    if (autoSequenceActive) {
      print("[BUSY] UPDATE SEQUENCE IN PROGRESS");
      return;
    }

    if (hauntingActive) {
      print("[BUSY] AUTH SEQUENCE STILL IN PROGRESS");
      return;
    }

    if (limboSequenceActive) {
      print("[BUSY] UNINSTALL SEQUENCE IN PROGRESS");
      return;
    }

    if (entry008SequenceActive) {
      print("[BUSY] HANDSHAKE SEQUENCE IN PROGRESS");
      return;
    }

    if (egregoreSequenceActive) {
      print("[BUSY] THE EGREGORE IS SPEAKING");
      return;
    }

    if (beliefExtracting) {
      print("[BUSY] EXTRACTING BELIEF");
      return;
    }

    // The final SystemCheck offer: after ENTRY 010 opens, `y` rolls the
    // credits and `n` reverses everything back to the rain riddle. Only the
    // exact single-letter answer is accepted while the prompt is pending.
    if (systemCheckPending) {
      if (cmd === "y" || cmd === "yes") {
        systemCheckPending = false;
        runCredits();
      } else if (cmd === "n" || cmd === "no") {
        systemCheckPending = false;
        triggerEsreverEvent();
      } else {
        print("run the system check. y/n ?");
      }
      return;
    }

    // One last loop after the credits land: `y` runs esrever to start the
    // experience over, `n` signs off (tab close in the browser build; the
    // packaged app will hard-quit instead).
    if (experienceAgainPending) {
      if (cmd === "y" || cmd === "yes") {
        experienceAgainPending = false;
        triggerEsreverEvent();
      } else if (cmd === "n" || cmd === "no") {
        experienceAgainPending = false;
        appendClue(EXPERIENCE_AGAIN_FAREWELL_TEXT, "clue-line--status");
        requestExperienceClose();
      } else {
        print("experience again? y/n ?");
      }
      return;
    }

    // Demon riddle is live after ENTRY 003 decrypts. Only the correct answer
    // advances; every wrong attempt counts, and on the third failure ENTRY
    // 003 gains its final image clue.
    if (demonRiddleActive) {
      if (cmd === TARGET_COMMAND_DEMON) {
        print("initiating manifest sequence...");
        triggerDemonEvent(function () {
          revealPost(DEMON_REVEAL_POST_ID);
          showFeed();
          appendClue("AUTH FAILED: SEE SYS ADMIN FOR ASSISTANCE", "clue-line--error");
          // The demon riddle is spent — hand over to the atmosphere phase.
          demonRiddleActive = false;
          startAtmosphereAutoSequence();
        });
      } else {
        demonRiddleFailures++;
        if (demonRiddleFailures >= DEMON_RIDDLE_MAX_FAILURES && !demonClueRevealed) {
          demonClueRevealed = true;
          revealEntryMedia(STATIC_REVEAL_POST_ID, DEMON_IMAGE_PATH);
          // An auth sting sounds the exact moment the hint image lands.
          new Audio(DEMON_CLUE_AUTH_PATH).play().catch(function () {});
          appendClue("FINAL_CLUE_DISPATCHED: ENTRY_003 payload image updated.", "clue-line--hint");
        }
        print((cmd || "(silence)") + " — " + warning());
      }
      return;
    }

    if (cmd === TARGET_COMMAND_RAIN) {
      print("initiating atmospheric auth...");
      triggerRainEvent(function () {
        revealPost(RAIN_REVEAL_POST_ID);
        showFeed();
        appendClue("auth complete. PASS: PAYLOAD_001", "clue-line--success");
      });
    } else if (cmd === TARGET_COMMAND) {
      // Once ENTRY 006 is revealed, `static` permanently replays the
      // RESIDUAL_GUILT glitch burst — the SECTOR_34 era is over, and the
      // player can re-read the key that flickered through the noise.
      if (getRevealedPostIds().includes(ASCEND_REVEAL_POST_ID)) {
        print("re-sweeping the signal...");
        triggerHauntedEvent(function () {
          appendClue("auth complete. the key flickered through the static again.", "clue-line--success");
        }, LIMBO_KEY_TEXT);
        return;
      }
      // Static haunting gates ENTRY 003. It only proceeds once ENTRY 002 has
      // been decrypted (its body holds this riddle), keeping the escape-room
      // progression in order.
      if (!getSolvedPostIds().includes(FIRST_DECRYPT_REVEAL_POST_ID)) {
        print("SEQUENCE NOT READY — DECRYPT THE PREVIOUS ENTRY FIRST.");
        return;
      }
      print("initiating signal sweep...");
      triggerHauntedEvent(function () {
        revealPost(STATIC_REVEAL_POST_ID);
        showFeed();
        appendClue("auth complete. KEY_HINT: the key flickered through the static.", "clue-line--success");
      });
    } else if (cmd === TARGET_COMMAND_ATMOSPHERE) {
      // Atmosphere gates ENTRY 005. It only opens once the note payload on
      // ENTRY 004 (THE_NOTE_pwd.png) has been revealed by clicking its '@'.
      if (!atmosphereArmed) {
        print("SEQUENCE NOT READY — FIND THE NOTE IN ENTRY_004.");
        return;
      }
      print("initiating atmosphere sweep...");
      triggerAtmosphereEvent(function () {
        revealPost(ATMOSPHERE_REVEAL_POST_ID);
        showFeed();
        appendClue("auth complete. ATMOSPHERE CLEARED.", "clue-line--success");
        // The only clue for ENTRY 005's key: ORWELL flashes red in the hint.
        flashClueKeyInLine("try 'ORWELL_VECT' to unlock the post", "ORWELL", "clue-key-flash");
      });
    } else if (cmd === TARGET_COMMAND_ASCEND) {
      // Ascend gates ENTRY 006. It only opens once LIMBO.EXE finishes
      // initializing; the key that flickered through the static burst
      // (RESIDUAL_GUILT) unlocks it.
      if (!ascendArmed) {
        print("SEQUENCE NOT READY — WAIT FOR LIMBO TO FINISH INITIALIZING.");
        return;
      }
      print("initiating ascent...");
      triggerAscendEvent(function () {
        revealPost(ASCEND_REVEAL_POST_ID);
        showFeed();
        appendClue("auth complete. LIMBO ENGAGED.", "clue-line--success");
        appendClue("// THE KEY FLICKERED THROUGH THE STATIC.", "clue-line--hint");
        // The word STATIC pulses red: the prompt to re-sweep the signal, which
        // replays the RESIDUAL_GUILT burst until ENTRY 006 decrypts.
        flashClueKeyInLine("// THE KEY FLICKERED THROUGH THE STATIC.", "STATIC", "clue-key-flash");
        // Terminal hue-cycles RGB on a loop until the entry is actually
        // decrypted, then the standard green returns.
        if (!getSolvedPostIds().includes(ASCEND_REVEAL_POST_ID)) startRgbCycle();
      });
    } else if (cmd === TARGET_COMMAND_HELL ||
          (hellCode && (cmd === hellCode.toLowerCase() ||
                        cmd === "err_://code:(" + hellCode.toLowerCase() + ").sys"))) {
      // Hell gates ENTRY 007. It arms once ENTRY 006 is decrypted; the hint
      // for 007 loads via a stuttering terminal bar rather than a text line.
      if (!hellArmed) {
        print("SEQUENCE NOT READY — DECRYPT THE PREVIOUS ENTRY FIRST.");
        return;
      }
      if (getRevealedPostIds().includes(HELL_REVEAL_POST_ID)) {
        print("the gate is already open.");
        return;
      }
      print("descending...");
      triggerHellEvent(function () {
        revealPost(HELL_REVEAL_POST_ID);
        showFeed();
        appendClue("// THE GATE ANSWERED. RECORDING WHAT IT SHOWED.", "clue-line--hint");
        runHellBootstrap();
      });
    } else if (cmd === TARGET_COMMAND_EGREGORE) {
      // The riddle printed into ENTRY 008 answers `egregore`. It reveals ENTRY
      // 009 (still encrypted — the SYS_FILE_333 key found via the '@' inside
      // ENTRY 008 decrypts it) and runs the manifestation in the terminal.
      runEgregoreCommand();
    } else if (cmd === TARGET_COMMAND_LORE) {
      // The pulsing L/O/R/E letters in the ENTRY 009 aftermath riddle spell
      // this command. It opens the final secret log (ENTRY 010).
      if (!getSolvedPostIds().includes(EGREGORE_REVEAL_POST_ID)) {
        print("SEQUENCE NOT READY — DECRYPT THE PREVIOUS ENTRY FIRST.");
        return;
      }
      if (!loreRiddleShown) {
        print("SEQUENCE NOT READY — DECODE THE RIDDLE.");
        return;
      }
      if (getRevealedPostIds().includes(LORE_POST_ID)) {
        print("the final log is already open.");
        return;
      }
      print("opening the final log...");
      revealLorePost();
      showFeed();
    } else {
      print((cmd || "(silence)") + " — " + warning());
    }
  }

  function triggerEsreverEvent() {
    const body = document.body;
    if (!body) return;

    // Reverse everything: wipe persisted state and any in-flight sequences,
    // then haunt the freshly reset terminal back to the rain riddle.
    resetGameState();
    beginHaunting("status-bgr");
    const esrever = new Audio("assets/audio/Inside_G093.mp3");
    const myGen = sceneGeneration;
    const startTime = performance.now();
    const CYCLE_DEG = 1080; // 3 full hue sweeps: R -> G -> B -> R, three times
    let rgbFrameId = null;

    function rgbCycle(now) {
      if (myGen !== sceneGeneration) { cancelAnimationFrame(rgbFrameId); rgbFrameId = null; return; }
      const elapsed = (now - startTime) / 1000;
      const duration = Number.isFinite(esrever.duration) && esrever.duration > 0
        ? esrever.duration
        : 9; // fallback if metadata hasn't loaded yet
      const hue = ((elapsed / duration) * CYCLE_DEG) % 360;

      body.style.setProperty("--phosphor", "hsl(" + hue + " 100% 50%)");
      body.style.setProperty("--phosphor-dim", "hsl(" + hue + " 80% 35%)");
      body.style.setProperty("--phosphor-hot", "hsl(" + hue + " 100% 68%)");
      body.style.setProperty(
        "--text-glow",
        "0 0 2px currentColor, 0 0 6px currentColor, 0 0 14px hsl(" + hue + " 100% 50% / 0.45)"
      );
      rgbFrameId = requestAnimationFrame(rgbCycle);
    }

    function stopEsrever() {
      if (rgbFrameId !== null) cancelAnimationFrame(rgbFrameId);
      rgbFrameId = null;
      body.style.removeProperty("--phosphor");
      body.style.removeProperty("--phosphor-dim");
      body.style.removeProperty("--phosphor-hot");
      body.style.removeProperty("--text-glow");
      endHaunting();
    }

    esrever.addEventListener("ended", stopEsrever);
    esrever.play().catch(stopEsrever);
    rgbFrameId = requestAnimationFrame(rgbCycle);
  }

  // Full reset to a fresh game: bumps the scene generation so every in-flight
  // sequence from the previous run bails, stops the looping drones, wipes all
  // persisted state, and restores the terminal to its original rain-riddle
  // boot state (header visible + AWAITING FIRST AUTH SEQUENCE).
  function resetGameState() {
    sceneGeneration++;
    stopAmbientLoop();
    stopStormLoop();
    stopPcLoop();
    stopRgbCycle();
    stopRainbowKeySpan();
    if (entry008RiddleTimer) { clearInterval(entry008RiddleTimer); entry008RiddleTimer = null; }

    // Wipe any overlay / body styling a reset caught mid-haunting, so the
    // fresh game never inherits a stray dim layer, class, or CSS variable.
    const body = document.body;
    const overlays = ["haunted-overlay", "rain-dim", "rain-drops", "ascend-dim", "ascend-drops", "demon-overlay", "amijok-overlay"];
    overlays.forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });
    if (body) {
      body.classList.remove("atmosphere", "ascend-flicker-wild", "hell-lightning", "hell-glitch");
      body.style.removeProperty("filter");
    }

    hauntingActive = false;
    demonRiddleActive = false;
    demonRiddleFailures = 0;
    demonClueRevealed = false;
    atmosphereArmed = false;
    autoSequenceActive = false;
    atmosphereNoteClicks = 0;
    atmosphereNoteRevealed = false;
    limboSequenceActive = false;
    ascendArmed = false;
    hellArmed = false;
    hellCode = null;
    // A big jump instead of 0 keeps any in-flight amijok run's token from
    // colliding with the next one after the reset.
    amijokToken = Date.now();
    amijokFirstRunDone = false;
    entry008SequenceActive = false;
    entry008RiddleTyped = "";
    entry008RiddlePrinted = false;
    entry008RiddleGen = 0;
    entry008NoteClicks = 0;
    entry008NoteArmed = false;
    entry008KeyFound = false;
    egregoreSequenceActive = false;
    loreRiddleShown = false;
    beliefExtracting = false;
    systemCheckPending = false;
    creditsActive = false;
    experienceAgainPending = false;

    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SOLVED_POSTS_KEY);
    sessionStorage.removeItem(GATEWAY_STORAGE_KEY);
    sessionStorage.removeItem(REVEALED_POSTS_KEY);
    sessionStorage.removeItem(MEDIA_OVERRIDES_KEY);
    sessionStorage.removeItem(TERMINAL_CLEARED_KEY);
    sessionStorage.removeItem(ENTRY_008_RIDDLE_STORAGE_KEY);
    sessionStorage.removeItem(ENTRY_008_KEY_STORAGE_KEY);
    sessionStorage.removeItem(ATMOSPHERE_AUTO_STORAGE_KEY);
    sessionStorage.removeItem(LIMBO_DONE_STORAGE_KEY);
    sessionStorage.removeItem(HELL_CODE_STORAGE_KEY);

    const board = document.getElementById("clue-board");
    if (board) board.innerHTML = "";
    const terminal = document.querySelector(".clue-terminal");
    if (terminal) terminal.classList.remove("clue-terminal--cleared");
    appendClue("AWAITING FIRST AUTH SEQUENCE...", "clue-line--status");
    renderPosts();
  }

  // One reversed credits load bar: originally-filling bars EMPTY (100 -> 0),
  // originally-draining bars FILL (0 -> 100), each at its original speed.
  function runCreditsBar(bar) {
    const gen = sceneGeneration;
    const board = document.getElementById("clue-board");
    if (!board) return;
    appendClue(bar.label, "clue-line--status");
    const line = document.createElement("div");
    line.className = "clue-line";
    board.appendChild(line);
    board.scrollTop = board.scrollHeight;
    let step = 0;
    const timer = setInterval(function () {
      if (gen !== sceneGeneration) { clearInterval(timer); return; }
      step++;
      let pct;
      if (bar.direction === "fill") {
        pct = Math.min(Math.round((step / bar.ticks) * 100), 100);
      } else {
        pct = Math.max(Math.round((1 - step / bar.ticks) * 100), 0);
      }
      const filled = Math.round((pct / 100) * 20);
      line.textContent =
        "[" + "█".repeat(filled) + "░".repeat(20 - filled) + "] " + String(pct).padStart(3, " ") + "%";
      board.scrollTop = board.scrollHeight;
      if (step >= bar.ticks) clearInterval(timer);
    }, bar.tickMs);
  }

  // The credits roll: every load bar appears one after another (a short
  // stagger), all running at once in reverse of their original direction.
  // When the longest of them finishes, the CREDITS.md block fades in.
  function runCredits() {
    if (creditsActive) return;
    creditsActive = true;
    const board = document.getElementById("clue-board");
    if (board) board.innerHTML = "";
    const bars = getCreditsBars();
    // The load bars swarm onto the board under Flies.mp3 the instant they pop.
    new Audio(FLIES_PATH).play().catch(function () {});
    let total = 0;
    bars.forEach(function (bar, i) {
      // Each bar starts at its own stagger offset and runs at its own speed,
      // so the true end is the latest individual (offset + duration), not the
      // longest bar alone.
      total = Math.max(total, CREDITS_BAR_DELAY_MS * i + bar.ticks * bar.tickMs);
      setTimeout(function () {
        if (creditsActive) runCreditsBar(bar);
      }, CREDITS_BAR_DELAY_MS * i);
    });
    setTimeout(function () {
      if (!creditsActive) return;
      appendClue("Running CREDITS.md.", "clue-line--status");
      showCredits();
    }, total + 200);
  }

  // Centered Egregore art + tagline + clickable store link, faded in together
  // over half a second with Credits.mp3 leading the fade.
  function showCredits() {
    const board = document.getElementById("clue-board");
    if (!board) return;
    const block = document.createElement("div");
    block.className = "clue-credits";

    const logo = document.createElement("img");
    logo.className = "clue-credits-logo";
    logo.src = "assets/images/LOGO_PROJECT.png";
    logo.alt = "LOGO_PROJECT";
    block.appendChild(logo);

    const art = document.createElement("pre");
    art.className = "clue-credits-art";
    art.textContent = CREDITS_ART;
    block.appendChild(art);

    const tag = document.createElement("div");
    tag.className = "clue-credits-tag";
    tag.textContent = CREDITS_TAGLINE;
    block.appendChild(tag);

    // Plain anchor with target=_blank: opens in the system browser in the
    // packaged app and in a new tab in a normal browser.
    const link = document.createElement("a");
    link.className = "clue-credits-link";
    link.href = CREDITS_LINK;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = CREDITS_LINK;
    block.appendChild(link);

    board.appendChild(block);
    board.scrollTop = board.scrollHeight;
    fitCreditsArt(art, board);

    new Audio(UI_CREDITS_PATH).play().catch(function () {});
    void block.offsetWidth;
    block.classList.add("clue-credits--in");

    // One last choice under the credits: `y` runs esrever to replay the
    // experience, `n` signs off.
    appendClue(EXPERIENCE_AGAIN_PROMPT_TEXT, "clue-line--status");
    experienceAgainPending = true;
  }

  // Ends the session. Browsers only honor window.close() for script-opened
  // windows, so this is best-effort in the web build; the packaged app will
  // replace this with a hard quit.
  function requestExperienceClose() {
    try {
      window.close();
    } catch (e) {}
  }

  // Scales the monospace art down so it fits the terminal width.
  function fitCreditsArt(art, board) {
    const avail = Math.max(board.clientWidth - 44, 120);
    let size = 12;
    art.style.fontSize = size + "px";
    const w = art.scrollWidth;
    if (w > avail && w > 0) {
      art.style.fontSize = Math.max(5, Math.floor((size * avail) / w)) + "px";
    }
  }

  // 9s after the final log opens, the archive offers the SystemCheck choice.
  function startSystemCheckPrompt() {
    const gen = sceneGeneration;
    setTimeout(function () {
      if (gen !== sceneGeneration) return;
      if (!getRevealedPostIds().includes(LORE_POST_ID)) return;
      appendClue(SYSTEMCHECK_PROMPT_TEXT, "clue-line--status");
      systemCheckPending = true;
    }, SYSTEMCHECK_DELAY_MS);
  }

  // THE secret event: `amijok` is ungated and re-runnable forever. The very
  // first run keeps the original quiet white-screen apology for three seconds;
  // every run after that picks a random crash screen, stretches it over the
  // whole window at full opacity, and holds it for exactly the length of
  // Glitch.mp3 — which also plays while the image blocks the screen. It never
  // touches the haunting flag, so it can fire mid-event without corrupting
  // that haunting's status.
  function triggerAmijokEvent() {
    const overlay = document.getElementById("amijok-overlay");
    if (!overlay) return;

    const token = ++amijokToken;

    const statusEl = document.getElementById("status-value");
    if (statusEl) {
      statusEl.textContent = "OFFLINE";
      statusEl.classList.add("status-offline");
      statusEl.classList.add("status-fade");
    }

    const dropStatus = function () {
      if (statusEl) statusEl.classList.remove("status-fade");
      if (!hauntingActive) restoreStatus();
    };

    if (!amijokFirstRunDone) {
      amijokFirstRunDone = true;
      // First and only quiet run: white screen + apology for three seconds.
      while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
      overlay.style.display = "flex";
      const messageElement = document.createElement("div");
      messageElement.className = "amijok-message";
      messageElement.textContent = "J, I heard the call. I'm sorry it took me so long...";
      overlay.appendChild(messageElement);

      setTimeout(() => {
        if (token !== amijokToken) return;
        overlay.style.display = "none";
        while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
        dropStatus();
      }, AMIJOK_FIRST_RUN_MS);
      return;
    }

    // Later runs: a random crash screen covers the whole window for as long
    // as Glitch.mp3, which plays over the blocking image.
    const pick = CRASH_SCREEN_PATHS[Math.floor(Math.random() * CRASH_SCREEN_PATHS.length)];
    while (overlay.firstChild) overlay.removeChild(overlay.firstChild);
    overlay.style.backgroundColor = "#000";
    overlay.style.backgroundImage = "url('" + pick + "')";
    overlay.style.backgroundSize = "cover";
    overlay.style.backgroundPosition = "center";
    overlay.style.display = "flex";

    const glitch = new Audio(CRASH_GLITCH_PATH);
    let cleanedUp = false;
    const hide = function () {
      if (cleanedUp) return;
      if (token !== amijokToken) return; // a newer run owns the screen now
      cleanedUp = true;
      clearTimeout(fallbackTimer);
      overlay.style.backgroundImage = "";
      overlay.style.backgroundColor = "";
      overlay.style.display = "none";
      glitch.src = "";
      dropStatus();
    };

    // Hold for the exact audio length once known, with a fallback so the
    // crash screen can never trap the user.
    let fallbackTimer = setTimeout(hide, GLITCH_DEFAULT_MS);
    glitch.addEventListener("loadedmetadata", function () {
      if (Number.isFinite(glitch.duration) && glitch.duration > 0) {
        clearTimeout(fallbackTimer);
        fallbackTimer = setTimeout(hide, glitch.duration * 1000);
      }
    });
    glitch.addEventListener("ended", hide);
    glitch.play().catch(function () { /* audio blocked: fallback timer covers it */ });
  }

  function updateVisitorCounterDisplay(count) {
    const container = document.getElementById("counter-digits");
    if (!container) return;
    const padded = String(count).padStart(6, "0");
    container.innerHTML = padded.split("").map(digit => `<span class="digit">${digit}</span>`).join("");
  }

  function getPosts() {
    // SEED_POSTS is the single source of truth for seeded entries — their
    // content, lock state, passwords, and hidden flags. Stored data may only
    // contribute dashboard-authored posts and runtime media overrides; it can
    // never control seed-post visibility. This is what keeps the reveal chain
    // permanently in order regardless of what's sitting in localStorage.
    const posts = freshSeeds();

    // 1. Overlay dashboard-authored posts (non-seed ids) from stored data.
    readStoredPosts().forEach(function (sp) {
      const isSeed = SEED_POSTS.some(function (s) { return s.id === sp.id; });
      if (!isSeed) posts.push(sp);
    });

    // 2. Overlay runtime media overrides (clue images) — session-scoped.
    const mediaOverrides = getMediaOverrides();
    posts.forEach(function (p) {
      if (mediaOverrides[p.id]) p.media = mediaOverrides[p.id];
    });

    // 3. Visibility is controlled exclusively by the reveal progression.
    const revealed = getRevealedPostIds();
    posts.forEach(function (p) {
      if (revealed.includes(p.id)) p.isHidden = false;
    });

    return posts;
  }

  function readStoredPosts() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  }

  function getRevealedPostIds() {
    const raw = sessionStorage.getItem(REVEALED_POSTS_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) || []; } catch { return []; }
  }

  function saveRevealedPostId(id) {
    const revealed = getRevealedPostIds();
    if (!revealed.includes(id)) {
      revealed.push(id);
      sessionStorage.setItem(REVEALED_POSTS_KEY, JSON.stringify(revealed));
    }
  }

  function getMediaOverrides() {
    const raw = sessionStorage.getItem(MEDIA_OVERRIDES_KEY);
    if (!raw) return {};
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch { return {}; }
  }

  function saveMediaOverride(id, mediaPath) {
    const overrides = getMediaOverrides();
    overrides[id] = mediaPath;
    sessionStorage.setItem(MEDIA_OVERRIDES_KEY, JSON.stringify(overrides));
  }

  // Deep-ish clone: copies each post object so runtime mutations (e.g. the
  // lore reveal) can never corrupt the SEED_POSTS source of truth.
  function freshSeeds() {
    return SEED_POSTS.map(function (post) { return Object.assign({}, post); });
  }

  function savePosts(posts) { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)); }
  function getSolvedPostIds() {
    const raw = sessionStorage.getItem(SOLVED_POSTS_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) || []; } catch { return []; }
  }
  function saveSolvedPostId(id) {
    const solved = getSolvedPostIds();
    if (!solved.includes(id)) {
      solved.push(id);
      sessionStorage.setItem(SOLVED_POSTS_KEY, JSON.stringify(solved));
    }
  }

  function buildMediaMarkup(media) {
    if (!media || media.trim() === "") return "";
    const value = media.trim();
    if (value.startsWith("<iframe")) return `<div class="entry-media entry-media--embed">${value}</div>`;
    if (/\.(mp3|wav|ogg)$/i.test(value)) return `<div class="entry-media entry-media--audio"><audio controls src="${value}"></audio></div>`;
    if (/\.(png|jpe?g|gif|webp|svg)$/i.test(value)) return `<div class="entry-media entry-media--image"><img src="${value}" alt="entry media" loading="lazy"></div>`;
    return `<div class="entry-media entry-media--link"><a href="${value}" target="_blank" rel="noopener noreferrer">${value}</a></div>`;
  }

  // Builds a single post's markup. Every entry — seeded or dynamically
  // created — renders through this one template, so the element hierarchy
  // stays locked to: index -> date -> title -> body (see style.css tiers).
  function buildEntryMarkup(post) {
    const isPostLocked = post.isLocked === true;
    const isSolved = getSolvedPostIds().includes(post.id);

    if (isPostLocked && !isSolved) {
      return `
        <article class="entry entry-locked" id="entry-${post.id}" data-entry="${post.id}">
          <div class="entry-meta">
            <span class="entry-index">ENTRY_${post.id} [SECURE_ARCHIVE]</span>
            <span class="entry-date">${post.date}</span>
          </div>
          <h2 class="entry-title">${post.title}</h2>
          <div class="entry-lock-box" style="margin-top: 15px; border: 1px dashed var(--phosphor-dim); padding: 16px;">
            <p class="error-text" style="margin-bottom: 12px; font-size: 0.85rem;">[!] DECRYPTION KEY REQUIRED TO READ THIS RECORD [!]</p>
            <div class="input-line" style="margin-top: 0;">
              <span class="prompt">KEY:_</span>
              <input type="text" class="post-decrypt-input" data-post-id="${post.id}" autocomplete="off" style="background: transparent; border: none; color: var(--phosphor); font-family: inherit; font-size: 0.9rem; flex: 1; outline: none; caret-color: var(--phosphor-hot);" >
            </div>
            <p class="post-error-msg" id="error-post-${post.id}" style="display: none; color: #ff5555; font-size: 0.8rem; margin-top: 8px; font-weight: bold;">INVALID KEY. RECORDS REMAIN CORRUPT.</p>
          </div>
        </article>`;
    }

    const mediaMarkup = buildMediaMarkup(post.media);
    const solvedTag = isPostLocked ? " <span style='color: var(--phosphor-hot); font-size: 0.75rem;'>[DECRYPTED]</span>" : "";
    const flickerClass = post.isLore ? " entry-flicker" : "";
    // ENTRY 002's capital-letter riddle letters stop pulsing once the static
    // haunting has run (i.e. ENTRY 003 was revealed).
    const riddleDoneClass = (post.id === RIDDLE_KEY_POST_ID && getRevealedPostIds().includes(STATIC_REVEAL_POST_ID))
      ? " entry--riddle-done"
      : "";
    // ENTRY 004 carries a hidden payload: an inert '@' that waits to be
    // clicked (see attachAtmosphereNoteListener) — never shown while locked.
    const noteMarkup = post.id === ATMOSPHERE_NOTE_POST_ID
      ? '<span class="atmosphere-note">@</span>'
      : "";
    // ENTRY 008 grows its own payload once the egregore dump completes: the
    // typed riddle renders statically (it types live into the DOM first), and
    // a clickable '@' arms after the REVIEW line. Its third click finds the
    // SYS_FILE_333 key that decrypts ENTRY 009.
    const entry008Markup = post.id === ENTRY_008_REVEAL_POST_ID
      ? (entry008RiddlePrinted
          ? '<div class="entry-riddle">' + ENTRY_008_RIDDLE_TEXT.split("\n").map(escapeHtml).join("<br>") + "</div>"
          : "")
        + (entry008NoteArmed
          ? '<span class="entry008-note' + (entry008KeyFound ? " entry008-note--done" : "") + '">@</span>'
          : "")
      : "";

    // Element order below is the display contract: index, date, title, body.
    return `
      <article class="entry${flickerClass}${riddleDoneClass}" id="entry-${post.id}" data-entry="${post.id}">
        <div class="entry-meta">
          <span class="entry-index">ENTRY_${post.id}${solvedTag}</span>
          <span class="entry-date">${post.date}</span>
        </div>
        <h2 class="entry-title">${post.title}</h2>
        <p class="entry-body">${post.body}</p>
        ${noteMarkup}
        ${entry008Markup}
        ${mediaMarkup}
      </article>`;
  }

  function attachPostLockListeners() {
    const inputs = document.querySelectorAll(".post-decrypt-input");
    inputs.forEach(input => {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          const postId = input.getAttribute("data-post-id");
          const attempt = input.value.trim();
          const posts = getPosts();
          const targetPost = posts.find(p => p.id === postId);
          const errorMsg = document.getElementById(`error-post-${postId}`);

          if (targetPost && targetPost.postPassword && attempt === targetPost.postPassword) {
            saveSolvedPostId(postId);
            onPostDecrypted(postId);
            renderPosts();
            // A successful decrypt kicks off a burst of static.
            new Audio(UI_BURST_PATH).play().catch(function () {});
          } else {
            input.value = "";
            if (errorMsg) {
              errorMsg.style.display = "block";
              errorMsg.classList.remove("glitch-flash");
              void errorMsg.offsetWidth;
              errorMsg.classList.add("glitch-flash");
            }
          }
        }
      });

      // Clicking anywhere on the lock box pulls focus into the key prompt,
      // so the in-post command line is fully interactive.
      const lockBox = input.closest(".entry-lock-box");
      if (lockBox) {
        lockBox.addEventListener("click", function (e) {
          if (e.target !== input) input.focus();
        });
      }
    });
  }

  // Half-second red screen stutter when the '@' reaches 6 clicks — reuses the
  // atmosphere class's color flip + CRT jitter, then immediately clears.
  function triggerNoteBlip() {
    const body = document.body;
    if (!body) return;
    body.classList.add("atmosphere");
    setTimeout(function () {
      body.classList.remove("atmosphere");
    }, 500);
  }

  // ENTRY 004's hidden '@' payload. It hums at the 3rd click, warns at the
  // 6th (with a half-second jitter), then after ATMOSPHERE_NOTE_CLICKS_REVEAL
  // (9) total clicks it drops THE_NOTE_pwd.png onto the post — which carries
  // the `atmosphere` command. Once revealed it goes inert (the media override
  // persists across reloads mid-session).
  function attachAtmosphereNoteListener() {
    const note = document.querySelector(".atmosphere-note");
    if (!note) return;
    if (atmosphereNoteRevealed) {
      note.classList.add("atmosphere-note--done");
      return;
    }
    note.addEventListener("click", function () {
      atmosphereNoteClicks++;
      const finalClick = atmosphereNoteClicks >= ATMOSPHERE_NOTE_CLICKS_REVEAL;
      // Audible tick on every '@' press — the final press rings out with
      // Reveal.mp3 instead of the physical tick.
      if (finalClick) {
        new Audio(UI_REVEAL_PATH).play().catch(function () {});
      } else {
        new Audio(UI_CLICK_PATH).play().catch(function () {});
      }
      if (atmosphereNoteClicks === ATMOSPHERE_NOTE_REACT_CLICKS) {
        appendClue("// the '@' hums... it is counting.", "clue-line--hint");
        new Audio(UI_MILESTONE_1_PATH).play().catch(function () {});
      }
      if (atmosphereNoteClicks === ATMOSPHERE_NOTE_ALMOST_CLICKS) {
        appendClue("// it is almost full. three more.", "clue-line--hint");
        triggerNoteBlip();
        new Audio(UI_MILESTONE_2_PATH).play().catch(function () {});
      }
      if (finalClick) {
        atmosphereNoteClicks = 0;
        atmosphereNoteRevealed = true;
        atmosphereArmed = true;
        note.classList.add("atmosphere-note--done");
        revealEntryMedia(ATMOSPHERE_NOTE_POST_ID, ATMOSPHERE_NOTE_IMAGE_PATH);
        appendClue("[SIG] NOTE_UNLOCKED. inspect the payload image for the next command.", "clue-line--hint");
      }
    });
  }

  // --------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------
  function renderPosts() {
    const container = document.getElementById("entries-container");
    if (!container) return;
    const posts = getPosts();
    const visible = posts.filter(function (p) { return !p.isHidden; });
    const sorted = visible.slice().sort(function (a, b) {
      // The final lore log always sits at the top, above the dated archive.
      if (a.isLore !== b.isLore) return a.isLore ? -1 : 1;
      return a.date < b.date ? 1 : -1;
    });
    container.innerHTML = sorted.map(buildEntryMarkup).join("");
    attachPostLockListeners();
    attachAtmosphereNoteListener();
    attachEntry008NoteListener();
  }

  document.addEventListener("DOMContentLoaded", () => {
    runBootSequence();
    initGateway();
    renderPosts();
    initClueTerminal();
    syncTerminalCleared();

    // Recover the escape-room phase across a mid-session reload:
    // - Note payload already revealed -> atmosphere phase is armed.
    // - ENTRY 004 revealed but note pending -> wait for the '@' clicks.
    // - ENTRY 003 decrypted, demon pending -> re-arm the demon riddle.
    const demonDone = getRevealedPostIds().includes(DEMON_REVEAL_POST_ID);
    const noteRevealed = !!getMediaOverrides()[ATMOSPHERE_NOTE_POST_ID];
    if (noteRevealed) {
      atmosphereArmed = true;
      atmosphereNoteRevealed = true;
    } else if (!demonDone && getSolvedPostIds().includes(STATIC_REVEAL_POST_ID)) {
      demonRiddleActive = true;
      demonRiddleFailures = 0;
      demonClueRevealed = false;
    }
    // ENTRY 004 revealed but the auto-update hadn't finished: resume it so the
    // ORWELL_VECT hint and ambient drone still arrive on their own. A persisted
    // completion marker means it already ran to the end on a previous load.
    if (getRevealedPostIds().includes(DEMON_REVEAL_POST_ID) &&
        !getRevealedPostIds().includes(ATMOSPHERE_REVEAL_POST_ID) &&
        !atmosphereArmed &&
        !sessionStorage.getItem(ATMOSPHERE_AUTO_STORAGE_KEY)) {
      startAtmosphereAutoSequence();
    }
    if (getSolvedPostIds().includes(ASCEND_REVEAL_POST_ID)) {
      hellArmed = true;
    }
    // ENTRY 006 solved but the corrupted ERR_://Code token didn't survive the
    // reload: restore the exact one generated last session so `hell` stays
    // reachable (and its hint line reprints with the same token).
    if (getSolvedPostIds().includes(ASCEND_REVEAL_POST_ID) &&
        !getRevealedPostIds().includes(HELL_REVEAL_POST_ID)) {
      hellCode = sessionStorage.getItem(HELL_CODE_STORAGE_KEY) || null;
      if (hellCode) {
        appendClue("// THE CALLING FROM ____ — answer it: ERR_://Code:(" + hellCode + ").sys", "clue-line--hint");
      }
    }
    // ENTRY 007 revealed but not yet decrypted: re-run the stuttering BKA_L
    // hint bar so the password for it stays available after a reload.
    if (getRevealedPostIds().includes(HELL_REVEAL_POST_ID) &&
        !getSolvedPostIds().includes(HELL_REVEAL_POST_ID)) {
      runHellBootstrap();
    }
    // ENTRY 006 revealed but not yet solved: the RGB hue-cycle resumes across
    // a mid-session reload (decrypting 006 stops it).
    if (getRevealedPostIds().includes(ASCEND_REVEAL_POST_ID) &&
        !getSolvedPostIds().includes(ASCEND_REVEAL_POST_ID)) {
      startRgbCycle();
    }
    // ENTRY 005 solved but the LIMBO phase hadn't handed over to `ascend`:
    // resume the sequence, or if a previous load already finished it, simply
    // re-arm the command instead of replaying the whole uninstall.
    if (getSolvedPostIds().includes(ATMOSPHERE_REVEAL_POST_ID) &&
        !getRevealedPostIds().includes(ASCEND_REVEAL_POST_ID)) {
      if (sessionStorage.getItem(LIMBO_DONE_STORAGE_KEY)) {
        ascendArmed = true;
      } else {
        startLimboSequence();
      }
    }
    // ENTRY 007 solved but 008 not yet unlocked: the handshake sequence
    // resumes across a mid-session reload.
    if (getSolvedPostIds().includes(HELL_REVEAL_POST_ID) &&
        !getRevealedPostIds().includes(ENTRY_008_REVEAL_POST_ID)) {
      startEntry008Sequence();
    }
    // ENTRY 008 unlocked: the typed riddle either resumes or renders statically
    // (if its reveal already started, per the persisted flag).
    if (getRevealedPostIds().includes(ENTRY_008_REVEAL_POST_ID)) {
      if (sessionStorage.getItem(ENTRY_008_RIDDLE_STORAGE_KEY)) {
        entry008RiddlePrinted = true;
      } else {
        startEntry008Riddle();
      }
    }
    // The SYS_FILE_333 key was found but ENTRY 009 is still encrypted: restore
    // the FILE LOCATED line and its rainbow until the decrypt happens.
    if (sessionStorage.getItem(ENTRY_008_KEY_STORAGE_KEY) &&
        !getSolvedPostIds().includes(EGREGORE_REVEAL_POST_ID)) {
      entry008KeyFound = true;
      appendClue(ENTRY_008_FILE_LOCATED_TEXT, "clue-line--hint");
      rainbowClueKey(ENTRY_008_FILE_LOCATED_TEXT, ENTRY_008_KEY_TEXT);
    }
    // ENTRY 009 revealed but not yet decrypted: the '@' inside ENTRY 008 must
    // stay clickable across a reload so the key search keeps being reachable.
    if (getRevealedPostIds().includes(EGREGORE_REVEAL_POST_ID) &&
        !getSolvedPostIds().includes(EGREGORE_REVEAL_POST_ID)) {
      entry008NoteArmed = true;
    }
    // ENTRY 009 solved but the final log not yet opened: restore the aftermath
    // error line and the LORE riddle so the `lore` command stays reachable.
    if (getSolvedPostIds().includes(EGREGORE_REVEAL_POST_ID) &&
        !getRevealedPostIds().includes(LORE_POST_ID)) {
      appendClue(LORE_ERROR_TEXT, "clue-line--lore-error");
      runLoreRiddle();
    }
    // The final log is open but the SystemCheck choice wasn't answered yet:
    // restore the prompt so `y` / `n` stay reachable after a reload.
    if (getRevealedPostIds().includes(LORE_POST_ID)) {
      appendClue(SYSTEMCHECK_PROMPT_TEXT, "clue-line--status");
      systemCheckPending = true;
    }
    // Both drones keep playing until the final log closes them: restart them
    // across a reload unless ENTRY 010 has already ended the game.
    if (!getRevealedPostIds().includes(LORE_POST_ID)) {
      if (sessionStorage.getItem(ATMOSPHERE_AUTO_STORAGE_KEY)) startAmbientLoop();
      if (getRevealedPostIds().includes(HELL_REVEAL_POST_ID)) startStormLoop();
    }
    // The recovery flags above affect rendered markup (the 008 riddle + note),
    // so re-render once more now that they're set.
    renderPosts();
  });

  window.OmegaTerm = {
    getPosts: getPosts,
    savePosts: savePosts,
    renderPosts: renderPosts
  };
})();