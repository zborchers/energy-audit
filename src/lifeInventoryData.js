// ---- THE ENERGY AUDIT — PART 1: THE LIFE INVENTORY ----
// Transcribed from energy-audit-life-inventory-draft.md (drafted and approved).
// Question text and options are verbatim from that spec. Each domain renders
// as one grouped screen (all its sub-questions together, one shared optional
// detail box), the same pattern already proven for the Root Cause tool's
// body-part forms.
//
// `chakraWeight` is internal-only — never shown in the UI, used by Part 2
// (the Anchor Analysis) to know which chakra territory each domain maps to.

export const LIFE_INVENTORY_DOMAINS = [
  {
    id: "time_attention",
    uiTitle: "Your Day",
    chakraWeight: ["root", "solarPlexus"],
    groups: [
      {
        key: "day_time_go",
        type: "multiselect",
        label: "On a typical day, where does most of your time actually go?",
        options: [
          "Work/career", "Caregiving", "Household management", "Screens/scrolling",
          "Errands and logistics", "Rest", "Hobbies or creative work", "Socializing",
          "Exercise", "Nothing — I don't really know where the day goes",
        ],
      },
      {
        key: "day_priorities",
        type: "singleSelect",
        label: "When you look at your calendar, whose priorities fill most of it?",
        options: ["Mine", "My family's", "My employer's", "Whoever asked most recently", "I don't have much say in it"],
      },
      {
        key: "day_unstructured_time",
        type: "singleSelect",
        label: "How much unstructured time do you have in a normal week — time with no obligation attached to it?",
        options: ["None", "Under an hour", "A few hours", "Most evenings/weekends", "Plenty"],
      },
    ],
    detailLabel: "Anything else about how your time actually gets spent that feels important? (optional)",
  },

  {
    id: "physical_body",
    uiTitle: "Your Body",
    chakraWeight: ["root"],
    groups: [
      {
        key: "sleep",
        type: "multiselect",
        label: "How would you describe your sleep?",
        options: [
          "I fall asleep easily", "I wake up in the night", "I wake up tired regardless of hours slept",
          "I stay up later than I mean to", "I sleep well", "I rely on something to fall asleep (screens, alcohol, medication)",
        ],
      },
      {
        key: "movement",
        type: "multiselect",
        label: "Movement in your body — what's actually true right now?",
        options: [
          "Regular intentional movement", "Movement only when required (stairs, errands)",
          "I used to move more than I do now", "My body feels foreign to me",
          "I'm in pain or discomfort most days", "Movement feels good when I do it",
        ],
      },
      {
        key: "food_drink",
        type: "multiselect",
        label: "What's your relationship with food and drink right now?",
        options: [
          "I eat on autopilot", "Food is a source of comfort", "Food is a source of guilt",
          "I skip meals often", "I use caffeine to function", "I use alcohol to unwind",
          "I eat pretty intuitively", "Something else is going on here",
        ],
      },
    ],
    detailLabel: "Anything else about your physical body worth naming? (optional)",
  },

  {
    id: "media_diet",
    uiTitle: "What You Take In",
    chakraWeight: ["sacral", "throat"],
    groups: [
      {
        key: "media_consume",
        type: "multiselect",
        label: "What do you consume most in your downtime?",
        options: [
          "Social media", "News", "TV/streaming", "Podcasts", "Music", "Books",
          "Nothing — I avoid screens", "Other people's opinions/drama",
        ],
      },
      {
        key: "media_feeling_after",
        type: "singleSelect",
        label: "After you consume media, how do you usually feel?",
        options: ["Drained", "Anxious", "Neutral", "Inspired", "Numb", "I don't notice"],
      },
      {
        key: "media_know_not_serving",
        type: "singleSelect",
        label: "Is there anything you consume that you know isn't serving you but keep returning to anyway?",
        options: ["Yes", "No", "Not sure"],
        followupIfYes: { key: "media_know_not_serving_detail", label: "What is it? (optional)" },
      },
    ],
    detailLabel: "Anything else about your media/information intake? (optional)",
  },

  {
    id: "relational_field",
    uiTitle: "Your People",
    chakraWeight: ["sacral", "heart"],
    groups: [
      {
        key: "who_talk_to",
        type: "multiselect",
        label: "Who do you talk to most regularly?",
        options: ["Partner/spouse", "Family", "Close friends", "Coworkers", "Online/strangers", "Mostly no one"],
      },
      {
        key: "give_receive_balance",
        type: "multiselect",
        label: "Thinking about your closest relationships — what's the general balance?",
        options: [
          "I give more than I receive", "I receive more than I give", "It feels mutual",
          "I'm not sure what I need from others", "I keep people at a distance", "I feel deeply supported",
        ],
      },
      {
        key: "relationship_costing_energy",
        type: "singleSelect",
        label: "Is there a relationship right now that's quietly costing you energy?",
        options: ["Yes", "No", "Not sure"],
        followupIfYes: { key: "relationship_costing_energy_detail", label: "What's the situation? (optional)" },
      },
    ],
    detailLabel: "Anything else about your relationships worth naming? (optional)",
  },

  {
    id: "grief_processing",
    uiTitle: "Moving Through Hard Things",
    chakraWeight: ["heart"],
    groups: [
      {
        key: "hard_thing_first_response",
        type: "multiselect",
        label: "When something hard happens, what do you tend to do first?",
        options: [
          "Push through and keep going", "Shut down", "Talk it out immediately",
          "Need time alone before I can talk", "Distract myself", "Get physically sick or tense",
          "Cry", "Get angry",
        ],
      },
      {
        key: "grief_relationship",
        type: "multiselect",
        label: "What's your relationship with grief specifically — loss, endings, things that didn't happen the way you hoped?",
        options: [
          "I let myself feel it fully", "I avoid it", "I intellectualize it",
          "I'm still carrying something I haven't processed", "I don't know how to grieve",
          "I've made peace with what I've lost",
        ],
      },
      {
        key: "unprocessed_past_year",
        type: "singleSelect",
        label: "Is there something from the past year you haven't fully dealt with?",
        options: ["Yes", "No", "Not sure"],
      },
    ],
    detailLabel: "Anything else about how you move through hard things? (optional)",
  },

  {
    id: "belief_system",
    uiTitle: "What You Believe",
    chakraWeight: ["solarPlexus", "throat"],
    groups: [
      {
        key: "beliefs_true",
        type: "multiselect",
        label: "Which of these beliefs feel true for you, even if you wish they didn't?",
        options: [
          "I have to earn rest", "I'm responsible for other people's feelings",
          "If I slow down, something will fall apart", "My worth is tied to what I produce",
          "I don't deserve more than I have", "Asking for help is weakness",
          "Things will probably go wrong", "I have to do it all myself",
        ],
      },
      {
        key: "belief_origin",
        type: "singleSelect",
        label: "Where do you think that belief came from?",
        options: ["Family of origin", "Religion/upbringing", "A specific past experience", "Culture/society at large", "I'm not sure"],
      },
    ],
    detailLabel: "Is there a belief you're aware of that you know isn't true but still run your life by? (optional)",
  },

  {
    id: "spiritual_location",
    uiTitle: "Where You Are",
    chakraWeight: ["thirdEye", "crown"],
    groups: [
      {
        key: "self_assessed_location",
        type: "singleSelect",
        label: "When you think about your own spiritual or inner development, where do you feel like you are?",
        options: [
          "Just trying to survive and stay afloat", "Working on relationships and creative expression",
          "Working on identity, power, and self-worth", "Working on the heart — love, grief, forgiveness",
          "Working on speaking my truth", "Working on trusting my intuition",
          "Feeling connected to something larger than myself", "Honestly, I haven't thought about it this way before",
        ],
      },
      {
        key: "awakening_turning_point",
        type: "singleSelect",
        label: "Have you had a period in your life you'd call a spiritual awakening or turning point?",
        options: ["Yes", "No", "Not sure"],
        followupIfYes: { key: "awakening_turning_point_detail", label: "What happened? (optional)" },
      },
    ],
    // This field is diagnostic of starting language, not scored — kept as
    // the domain's open detail field rather than a separate question.
    detailLabel: "What does \"energy\" mean to you right now, before we go any further? (optional)",
  },

  {
    id: "environment",
    uiTitle: "Your Space",
    chakraWeight: ["root"],
    groups: [
      {
        key: "home_feeling",
        type: "multiselect",
        label: "How does your home feel to you right now?",
        options: ["Peaceful", "Cluttered", "Not really mine", "A place I avoid", "Safe", "Chaotic", "I don't spend much time there"],
      },
      {
        key: "space_reflects_self",
        type: "singleSelect",
        label: "Does your physical space reflect who you actually are, or who you used to be / think you should be?",
        options: ["Reflects who I am now", "Reflects an old version of me", "I've never thought about it", "Reflects someone else's taste or needs, not mine"],
      },
    ],
    detailLabel: "Anything else about your environment worth naming? (optional)",
  },

  {
    id: "formative_years",
    uiTitle: "Growing Up",
    chakraWeight: ["root", "sacral"],
    // Deepest domain in the audit — split into two explicit age windows,
    // rendered as one continuous screen with a visual break between them.
    ageWindows: [
      {
        rangeLabel: "Ages 0–7 — what you absorbed about safety, belonging, and worth",
        groups: [
          {
            key: "money_safety_early",
            type: "multiselect",
            label: "What was your family's relationship to money and safety like when you were very young?",
            options: [
              "Scarcity, or a sense that there was never enough", "Money caused conflict or tension",
              "Money was controlled tightly by one person", "Stable and rarely discussed",
              "Steady and safe", "I honestly don't know — it wasn't visible to me as a child",
            ],
          },
          {
            key: "family_role",
            type: "multiselect",
            label: "What role did you find yourself playing in your family, even before you could have named it?",
            options: [
              "The responsible one", "The peacemaker", "The one who stayed small",
              "The caretaker of a parent's feelings", "The achiever/golden child",
              "The one who got overlooked", "The one who took the blame", "I'm not sure",
            ],
          },
          {
            key: "security_earned",
            type: "singleSelect",
            label: "As a young child, did you feel like your place in your family was secure, or like you had to earn it?",
            options: [
              "Secure, no question", "Mostly secure", "I had to behave a certain way to keep it",
              "I had to earn it constantly", "I never felt fully secure",
            ],
          },
        ],
        // Deliberately open-ended and unscored — often the richest answer in
        // the whole audit. Rendered as this window's own detail box rather
        // than folded into the domain-level one at the bottom.
        detailKey: "safety_belonging_worth_detail",
        detailLabel: "Before you had words for it — what did you learn about whether the world was safe, whether you belonged, or whether your needs would actually be met? (optional)",
      },
      {
        rangeLabel: "Ages 7–14 — what you learned about relationships, power, and your own creative and emotional life",
        groups: [
          {
            key: "peer_relationships",
            type: "multiselect",
            label: "How would you describe your friendships and peer relationships during these years?",
            options: [
              "I was often left out or rejected", "I learned to please people to keep them close",
              "I felt confident and connected", "I withdrew and kept to myself",
              "I became the one who kept the peace in the group", "I don't remember much from this period",
            ],
          },
          {
            key: "creativity_response",
            type: "singleSelect",
            label: "Was your creativity — art, play, imagination, self-expression — encouraged or discouraged during this time?",
            options: [
              "Actively encouraged", "Mostly ignored", "Actively discouraged or mocked",
              "Only valued when it produced results (grades, recognition, performance)", "Not sure",
            ],
          },
          {
            key: "feelings_treatment",
            type: "singleSelect",
            label: "Looking back at this age, did you learn that your feelings mattered, or that they were inconvenient / too much / better kept private?",
            options: ["They mattered", "They were tolerated but not really welcomed", "They were treated as too much", "I learned to keep them private", "Not sure"],
          },
          {
            key: "boundary_violation",
            type: "singleSelect",
            label: "Was there anything in this window — physically, emotionally, or otherwise — where a boundary of yours wasn't respected?",
            options: ["Yes", "No", "Prefer not to say"],
            // Deliberately NO follow-up text field, per spec — if yes, this
            // gets held for the Part 2 conversation to approach with care,
            // never pressed for detail in the static intake.
            noFollowup: true,
          },
        ],
        detailKey: "formative_pattern_detail",
        detailLabel: "What's a pattern you can trace back to this age — people-pleasing, rebellion, staying invisible, performing for approval, anything else? (optional)",
      },
    ],
  },
];

// Later developmental windows (14–21 solar plexus, 21–28 heart, and onward)
// are intentionally NOT asked statically — see spec note. Part 2's
// conversation picks these up conversationally, using age-appropriate
// developmental windows as its interpretive lens, never presuming a window
// has been reached just because someone has lived past that age.
