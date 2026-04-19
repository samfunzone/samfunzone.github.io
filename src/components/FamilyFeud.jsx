import { useState, useRef } from 'react';
import { launchConfetti } from '../utils/confetti';

// Normalise a guess for comparison
const norm = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();

const QUESTIONS = [
  {
    question: 'What would you find in a haunted house?',
    answers: [
      { text: 'Ghosts',    points: 24, aliases: ['ghost', 'ghosts', 'spirit', 'spirits'] },
      { text: 'Cobwebs',   points: 18, aliases: ['cobweb', 'cobwebs', 'spider web', 'spider webs', 'webs'] },
      { text: 'Spiders',   points: 14, aliases: ['spider', 'spiders'] },
      { text: 'Bats',      points: 12, aliases: ['bat', 'bats'] },
      { text: 'Mice',      points: 10, aliases: ['mouse', 'mice', 'rats', 'rat'] },
      { text: 'Darkness',  points: 8,  aliases: ['dark', 'darkness', 'no lights', 'blackness'] },
    ],
  },
  {
    question: 'What do you do right before going to bed?',
    answers: [
      { text: 'Brush teeth',      points: 30, aliases: ['brush teeth', 'brush my teeth', 'brush your teeth', 'teeth'] },
      { text: 'Put on pajamas',   points: 25, aliases: ['pajamas', 'pjs', 'put on pjs', 'put on pajamas', 'change clothes', 'get changed'] },
      { text: 'Read a book',      points: 20, aliases: ['read', 'reading', 'read a book', 'read a story', 'storytime'] },
      { text: 'Take a bath',      points: 16, aliases: ['bath', 'shower', 'take a bath', 'take a shower', 'wash up'] },
      { text: 'Check your phone', points: 12, aliases: ['phone', 'check phone', 'check your phone', 'scroll phone', 'go on phone'] },
      { text: 'Turn off the lights', points: 8, aliases: ['turn off lights', 'turn off the lights', 'lights out', 'lights off'] },
    ],
  },
  {
    question: 'What can you find in outer space?',
    answers: [
      { text: 'Stars',       points: 30, aliases: ['star', 'stars'] },
      { text: 'Planets',     points: 26, aliases: ['planet', 'planets'] },
      { text: 'The moon',    points: 22, aliases: ['moon', 'the moon'] },
      { text: 'The sun',     points: 18, aliases: ['sun', 'the sun'] },
      { text: 'Asteroids',   points: 14, aliases: ['asteroid', 'asteroids', 'meteor', 'meteors', 'rocks'] },
      { text: 'Spaceships',  points: 10, aliases: ['spaceship', 'spaceships', 'rocket', 'rockets', 'ufo', 'ufos'] },
    ],
  },
  {
    question: 'What do you do on a summer day?',
    answers: [
      { text: 'Swim',              points: 30, aliases: ['swim', 'swimming', 'go swimming', 'pool', 'go to the pool'] },
      { text: 'Play outside',      points: 25, aliases: ['play outside', 'go outside', 'play outdoors', 'play in the yard'] },
      { text: 'Eat ice cream',     points: 20, aliases: ['ice cream', 'eat ice cream', 'get ice cream'] },
      { text: 'Go to camp',        points: 15, aliases: ['camp', 'go to camp', 'summer camp'] },
      { text: 'Have a picnic',     points: 12, aliases: ['picnic', 'have a picnic', 'go on a picnic'] },
      { text: 'Have friends over', points: 8,  aliases: ['friends over', 'have friends over', 'invite friends', 'hang out with friends'] },
    ],
  },
  {
    question: 'Name something you see at a carnival',
    answers: [
      { text: 'Ferris wheel',   points: 30, aliases: ['ferris wheel', 'big wheel', 'ferris'] },
      { text: 'Cotton candy',   points: 26, aliases: ['cotton candy', 'candyfloss', 'candy floss'] },
      { text: 'Carousel',       points: 22, aliases: ['carousel', 'merry go round', 'merry-go-round', 'horses'] },
      { text: 'Games / Booths', points: 16, aliases: ['games', 'booths', 'game booths', 'carnival games', 'ring toss', 'prize games'] },
      { text: 'Roller coaster', points: 12, aliases: ['roller coaster', 'rollercoaster', 'coaster', 'ride', 'rides'] },
      { text: 'Clowns',         points: 8,  aliases: ['clown', 'clowns'] },
    ],
  },
  {
    question: 'Name something you never leave home without',
    answers: [
      { text: 'Phone',    points: 38, aliases: ['phone', 'cell phone', 'mobile', 'my phone'] },
      { text: 'Keys',     points: 28, aliases: ['key', 'keys', 'house keys'] },
      { text: 'Shoes',    points: 20, aliases: ['shoe', 'shoes', 'sneakers', 'footwear'] },
      { text: 'Wallet',   points: 16, aliases: ['wallet', 'purse', 'money', 'cash', 'bag'] },
      { text: 'Backpack', points: 12, aliases: ['backpack', 'bag', 'school bag', 'bookbag'] },
      { text: 'Jacket',   points: 8,  aliases: ['jacket', 'coat', 'hoodie', 'sweater'] },
    ],
  },
  {
    question: 'Name a kid\'s game that adults still enjoy playing',
    answers: [
      { text: 'Hide and Seek', points: 31, aliases: ['hide and seek', 'hide & seek', 'hide and go seek'] },
      { text: 'Twister',       points: 26, aliases: ['twister'] },
      { text: 'Uno',           points: 20, aliases: ['uno', 'uno card game'] },
      { text: 'Tag',           points: 16, aliases: ['tag', 'freeze tag', 'it', 'youre it'] },
      { text: 'Candyland',     points: 12, aliases: ['candyland', 'candy land'] },
      { text: 'Hopscotch',     points: 8,  aliases: ['hopscotch'] },
    ],
  },
  {
    question: 'Name a chore that people hate doing',
    answers: [
      { text: 'Taking out the trash',  points: 30, aliases: ['trash', 'take out trash', 'taking out the trash', 'garbage', 'take out garbage'] },
      { text: 'Folding laundry',       points: 25, aliases: ['folding laundry', 'fold laundry', 'laundry', 'fold clothes'] },
      { text: 'Cleaning the bathroom', points: 20, aliases: ['clean bathroom', 'cleaning the bathroom', 'bathroom', 'scrub toilet'] },
      { text: 'Vacuuming',             points: 16, aliases: ['vacuum', 'vacuuming', 'hoover', 'hoovering'] },
      { text: 'Washing dishes',        points: 12, aliases: ['dishes', 'washing dishes', 'wash dishes', 'do the dishes'] },
      { text: 'Mowing the lawn',       points: 8,  aliases: ['mow', 'mowing', 'mow the lawn', 'mowing the lawn', 'grass', 'cut the grass'] },
    ],
  },
  {
    question: 'Name something at home that people often run out of',
    answers: [
      { text: 'Toilet paper', points: 32, aliases: ['toilet paper', 'tp', 'loo roll', 'tissue'] },
      { text: 'Milk',         points: 28, aliases: ['milk'] },
      { text: 'Bread',        points: 20, aliases: ['bread', 'loaf'] },
      { text: 'Eggs',         points: 16, aliases: ['egg', 'eggs'] },
      { text: 'Shampoo',      points: 12, aliases: ['shampoo', 'conditioner', 'shampoo and conditioner'] },
      { text: 'Hand soap',    points: 8,  aliases: ['soap', 'hand soap', 'dish soap', 'body wash'] },
    ],
  },
  {
    question: 'What\'s the first thing you do when you wake up?',
    answers: [
      { text: 'Check your phone', points: 34, aliases: ['phone', 'check phone', 'check your phone', 'look at phone', 'scroll phone'] },
      { text: 'Hit snooze',       points: 26, aliases: ['snooze', 'hit snooze', 'go back to sleep', 'sleep more', 'press snooze'] },
      { text: 'Go to the bathroom', points: 20, aliases: ['bathroom', 'go to the bathroom', 'toilet', 'pee'] },
      { text: 'Eat breakfast',    points: 14, aliases: ['breakfast', 'eat breakfast', 'eat', 'food'] },
      { text: 'Stretch / Yawn',   points: 10, aliases: ['stretch', 'yawn', 'stretching', 'yawning'] },
      { text: 'Get dressed',      points: 8,  aliases: ['get dressed', 'get changed', 'put on clothes', 'clothes'] },
    ],
  },
  {
    question: 'Name a reason you might not reply to a text message',
    answers: [
      { text: 'Forgot',              points: 32, aliases: ['forgot', 'forget', 'i forgot', 'forgetting'] },
      { text: 'Too busy',            points: 26, aliases: ['busy', 'too busy', 'i was busy'] },
      { text: 'Phone was dead',      points: 20, aliases: ['phone dead', 'no battery', 'phone died', 'dead phone', 'out of battery'] },
      { text: 'Didn\'t see it',      points: 18, aliases: ['didnt see it', 'missed it', 'didnt notice', 'havent read it', 'unread'] },
      { text: 'Didn\'t know what to say', points: 12, aliases: ['not sure what to say', 'didnt know what to say', 'no words', 'hard to reply'] },
      { text: 'No signal',           points: 8,  aliases: ['no signal', 'no wifi', 'no service', 'bad signal', 'no internet'] },
    ],
  },
  {
    question: 'What do you miss most about school during summer?',
    answers: [
      { text: 'Friends',    points: 38, aliases: ['friends', 'my friends', 'seeing friends', 'hanging out with friends'] },
      { text: 'Recess',     points: 28, aliases: ['recess', 'break time', 'play time', 'outdoor time'] },
      { text: 'Teachers',   points: 20, aliases: ['teacher', 'teachers', 'my teacher'] },
      { text: 'Lunch',      points: 16, aliases: ['lunch', 'lunchtime', 'school lunch', 'cafeteria'] },
      { text: 'Sports / PE', points: 12, aliases: ['sports', 'pe', 'gym', 'physical education', 'games'] },
      { text: 'Learning',   points: 8,  aliases: ['learning', 'classes', 'lessons', 'studying'] },
    ],
  },
  {
    question: 'Name a food you can eat with your hands',
    answers: [
      { text: 'Pizza',    points: 32, aliases: ['pizza'] },
      { text: 'Burger',   points: 26, aliases: ['burger', 'hamburger', 'cheeseburger'] },
      { text: 'Tacos',    points: 20, aliases: ['taco', 'tacos'] },
      { text: 'Sandwich', points: 16, aliases: ['sandwich', 'sub', 'wrap'] },
      { text: 'Fruit',    points: 12, aliases: ['fruit', 'apple', 'banana', 'grapes'] },
      { text: 'Chips',    points: 8,  aliases: ['chips', 'fries', 'crisps', 'french fries'] },
    ],
  },
  {
    question: 'What makes you healthy and strong?',
    answers: [
      { text: 'Eating vegetables', points: 32, aliases: ['vegetables', 'veggies', 'eating vegetables', 'eat your veggies', 'salad'] },
      { text: 'Exercise',          points: 28, aliases: ['exercise', 'working out', 'sports', 'running', 'playing outside'] },
      { text: 'Drinking water',    points: 22, aliases: ['water', 'drinking water', 'stay hydrated'] },
      { text: 'Sleeping enough',   points: 16, aliases: ['sleep', 'sleeping', 'rest', 'good sleep', 'enough sleep'] },
      { text: 'Drinking milk',     points: 12, aliases: ['milk', 'drinking milk', 'calcium'] },
      { text: 'Eating fruit',      points: 8,  aliases: ['fruit', 'eating fruit', 'fruits'] },
    ],
  },
  {
    question: 'Name something a dog does',
    answers: [
      { text: 'Bark',       points: 34, aliases: ['bark', 'barking', 'woof'] },
      { text: 'Wag its tail', points: 28, aliases: ['wag tail', 'wagging', 'wag its tail', 'tail wag'] },
      { text: 'Lick you',   points: 22, aliases: ['lick', 'licking', 'lick you', 'lick your face'] },
      { text: 'Fetch',      points: 16, aliases: ['fetch', 'play fetch', 'get the ball', 'retrieve'] },
      { text: 'Roll over',  points: 12, aliases: ['roll over', 'rolls over', 'rolling over'] },
      { text: 'Scratch',    points: 8,  aliases: ['scratch', 'scratching', 'itch', 'scratch itself'] },
    ],
  },
  {
    question: 'Name something a kid would do to avoid going to bed',
    answers: [
      { text: 'Ask for water',         points: 40, aliases: ['water', 'ask for water', 'get water', 'want water', 'thirsty', 'drink'] },
      { text: 'Say they\'re not tired', points: 32, aliases: ['not tired', 'im not tired', 'say not tired', 'claim not tired', 'not sleepy'] },
      { text: 'Ask for one more story', points: 22, aliases: ['one more story', 'another story', 'more story', 'read a story', 'story'] },
      { text: 'Go to the bathroom',    points: 18, aliases: ['bathroom', 'go to the bathroom', 'toilet', 'potty', 'need the loo'] },
      { text: 'Say they\'re hungry',   points: 14, aliases: ['hungry', 'im hungry', 'want a snack', 'snack', 'food'] },
      { text: 'Keep talking',          points: 10, aliases: ['keep talking', 'talk', 'ask questions', 'chatting', 'not stop talking'] },
    ],
  },
  {
    question: 'If you could change one rule at school, what would it be?',
    answers: [
      { text: 'No homework',        points: 45, aliases: ['no homework', 'remove homework', 'get rid of homework', 'homework'] },
      { text: 'More recess',        points: 30, aliases: ['more recess', 'longer recess', 'extra recess', 'recess'] },
      { text: 'No tests',           points: 22, aliases: ['no tests', 'no exams', 'no quizzes', 'remove tests'] },
      { text: 'Shorter school day', points: 18, aliases: ['shorter day', 'end early', 'less school', 'short school day', 'shorter school'] },
      { text: 'Allow phones',       points: 12, aliases: ['phones', 'allow phones', 'use phones', 'phone in class'] },
      { text: 'Better lunch',       points: 8,  aliases: ['better lunch', 'better food', 'good food', 'nice lunch'] },
    ],
  },
  {
    question: 'Name something a dragon might breathe out instead of fire',
    answers: [
      { text: 'Ice / Snow',  points: 38, aliases: ['ice', 'snow', 'frost', 'freeze', 'cold', 'blizzard', 'ice and snow'] },
      { text: 'Glitter',     points: 28, aliases: ['glitter', 'sparkles', 'sparkle'] },
      { text: 'Bubbles',     points: 20, aliases: ['bubble', 'bubbles', 'soap bubbles'] },
      { text: 'Candy',       points: 16, aliases: ['candy', 'sweets', 'chocolate', 'lollipops'] },
      { text: 'Rainbows',    points: 12, aliases: ['rainbow', 'rainbows', 'colors', 'colours'] },
      { text: 'Slime',       points: 8,  aliases: ['slime', 'goo', 'goop'] },
    ],
  },
  {
    question: 'If you had a million dollars, what\'s the first thing you\'d buy?',
    answers: [
      { text: 'A mansion / big house', points: 38, aliases: ['mansion', 'house', 'big house', 'a house', 'castle'] },
      { text: 'Toys & games',          points: 28, aliases: ['toys', 'games', 'video games', 'toy', 'lots of toys', 'all the toys'] },
      { text: 'A car',                 points: 22, aliases: ['car', 'fancy car', 'sports car', 'cool car'] },
      { text: 'Travel the world',      points: 16, aliases: ['travel', 'travel the world', 'vacation', 'holiday', 'trips', 'go everywhere'] },
      { text: 'Give to family',        points: 12, aliases: ['give to family', 'give my family', 'help my family', 'share with family'] },
      { text: 'Donate to charity',     points: 8,  aliases: ['charity', 'donate', 'give to charity', 'help others', 'help people'] },
    ],
  },
  {
    question: 'Name something that always makes people laugh',
    answers: [
      { text: 'Jokes / Puns',              points: 40, aliases: ['joke', 'jokes', 'pun', 'puns', 'dad joke', 'dad jokes', 'funny jokes'] },
      { text: 'Funny faces',               points: 30, aliases: ['funny face', 'funny faces', 'silly face', 'silly faces', 'making faces'] },
      { text: 'Tickling',                  points: 22, aliases: ['tickle', 'tickling', 'tickles', 'being tickled'] },
      { text: 'Silly noises',              points: 16, aliases: ['silly noise', 'silly noises', 'funny sounds', 'weird noises'] },
      { text: 'Someone tripping / falling', points: 12, aliases: ['falling', 'fall', 'trip', 'tripping', 'slip', 'someone falling'] },
      { text: 'Funny animal videos',       points: 8,  aliases: ['funny animals', 'animal videos', 'animals', 'cute animals', 'animals being silly'] },
    ],
  },
  {
    question: 'If you could swap lives with anyone for a day, who would it be?',
    answers: [
      { text: 'A celebrity / pop star', points: 38, aliases: ['celebrity', 'pop star', 'singer', 'actor', 'famous person', 'superstar', 'movie star'] },
      { text: 'A superhero',            points: 28, aliases: ['superhero', 'super hero', 'spiderman', 'batman', 'wonder woman'] },
      { text: 'A pro athlete',          points: 20, aliases: ['athlete', 'pro athlete', 'footballer', 'soccer player', 'basketball player', 'sports star'] },
      { text: 'A teacher',              points: 16, aliases: ['teacher', 'my teacher', 'the teacher'] },
      { text: 'A pet / animal',         points: 12, aliases: ['pet', 'dog', 'cat', 'animal', 'my dog', 'my cat'] },
      { text: 'My best friend',         points: 8,  aliases: ['best friend', 'my friend', 'friend', 'bff'] },
    ],
  },
  {
    question: 'If you could only eat one food forever, what would it be?',
    answers: [
      { text: 'Pizza',    points: 40, aliases: ['pizza'] },
      { text: 'Ice Cream', points: 28, aliases: ['ice cream', 'icecream'] },
      { text: 'Chicken',  points: 20, aliases: ['chicken', 'fried chicken', 'chicken nuggets', 'nuggets'] },
      { text: 'Pasta',    points: 16, aliases: ['pasta', 'spaghetti', 'noodles', 'mac and cheese', 'macaroni'] },
      { text: 'Tacos',    points: 12, aliases: ['taco', 'tacos'] },
      { text: 'Burgers',  points: 8,  aliases: ['burger', 'burgers', 'hamburger', 'cheeseburger'] },
    ],
  },
  {
    question: 'Name a way you know your teacher is having a bad day',
    answers: [
      { text: 'Yells a lot',         points: 36, aliases: ['yells', 'yelling', 'yells a lot', 'screaming', 'screams', 'shouts', 'loud'] },
      { text: 'Grumpy / Mean',       points: 22, aliases: ['grumpy', 'mean', 'cranky', 'moody', 'in a bad mood', 'grouchy'] },
      { text: 'Extra homework',      points: 19, aliases: ['extra homework', 'more homework', 'gives extra homework', 'assigns more work', 'homework'] },
      { text: 'Gives punishments',   points: 16, aliases: ['punishments', 'detention', 'gives detention', 'punishes students', 'discipline'] },
      { text: 'Facial expression',   points: 3,  aliases: ['facial expression', 'look on their face', 'face', 'expression', 'body language', 'you can tell by their face'] },
    ],
  },
  {
    question: 'Name something you might see a lifeguard carrying',
    answers: [
      { text: 'Whistle',         points: 33, aliases: ['whistle'] },
      { text: 'Life preserver',  points: 28, aliases: ['life preserver', 'life ring', 'ring', 'buoy', 'float', 'floatie', 'flotation device', 'life vest', 'ring buoy'] },
      { text: 'Towel',           points: 15, aliases: ['towel', 'towels'] },
      { text: 'Surfboard',       points: 11, aliases: ['surfboard', 'board', 'rescue board'] },
      { text: 'A person',        points: 3,  aliases: ['person', 'a person', 'someone', 'a swimmer', 'rescued person', 'carrying someone'] },
    ],
  },
  {
    question: 'Name something you avoid doing, but feel better after it\'s done',
    answers: [
      { text: 'Cleaning',  points: 52, aliases: ['cleaning', 'clean', 'tidy up', 'tidying', 'clean the house', 'tidying up'] },
      { text: 'Exercise',  points: 15, aliases: ['exercise', 'workout', 'work out', 'run', 'running', 'gym', 'working out'] },
      { text: 'Shower',    points: 13, aliases: ['shower', 'showering', 'bath', 'bathing', 'wash up', 'washing'] },
      { text: 'Laundry',   points: 10, aliases: ['laundry', 'washing clothes', 'doing laundry', 'wash clothes'] },
      { text: 'Homework',  points: 4,  aliases: ['homework', 'studying', 'study', 'school work', 'schoolwork'] },
    ],
  },
  {
    question: 'Name a reason you might get grounded',
    answers: [
      { text: 'Not doing homework',    points: 40, aliases: ['homework', 'not doing homework', 'skipping homework', 'not finishing homework', 'bad grades', 'grades'] },
      { text: 'Fighting with siblings', points: 25, aliases: ['fighting', 'fight', 'fighting with siblings', 'hit sibling', 'fighting with brother', 'fighting with sister', 'sibling fight'] },
      { text: 'Talking back',          points: 20, aliases: ['talking back', 'back talk', 'rude', 'disrespectful', 'arguing', 'arguing with parents', 'backtalk'] },
      { text: 'Not cleaning your room', points: 10, aliases: ['messy room', 'not cleaning room', 'dirty room', 'room messy', 'not cleaning', 'messy house'] },
      { text: 'Staying up too late',   points: 5,  aliases: ['staying up late', 'up too late', 'past bedtime', 'not sleeping', 'late night'] },
    ],
  },
  {
    question: 'Name something you almost always eat out of a bag',
    answers: [
      { text: 'Chips',        points: 68, aliases: ['chips', 'crisps', 'potato chips', 'chip'] },
      { text: 'Popcorn',      points: 18, aliases: ['popcorn', 'pop corn'] },
      { text: 'French fries', points: 5,  aliases: ['fries', 'french fries', 'french fry'] },
      { text: 'Candy',        points: 5,  aliases: ['candy', 'sweets', 'gummies', 'gummy bears', 'lollies'] },
      { text: 'Peanuts',      points: 3,  aliases: ['peanuts', 'nuts', 'peanut', 'mixed nuts'] },
    ],
  },
  {
    question: "Tell me a type of work vehicle that's often seen as a children's toy",
    answers: [
      { text: 'Dump Truck',  points: 43, aliases: ['dump truck', 'dumper', 'dumper truck'] },
      { text: 'Fire Engine', points: 34, aliases: ['fire engine', 'fire truck', 'fire car', 'firetruck'] },
      { text: 'Tractor',     points: 10, aliases: ['tractor', 'farm tractor'] },
      { text: 'Police Car',  points: 6,  aliases: ['police car', 'cop car', 'police vehicle', 'police'] },
      { text: 'Bulldozer',   points: 3,  aliases: ['bulldozer', 'bull dozer'] },
    ],
  },

  // ── Fun & Imaginative ──────────────────────────────────────────────────────
  {
    question: 'Name something you find in a wizard\'s pocket',
    answers: [
      { text: 'Magic dust',     points: 40, aliases: ['magic dust', 'fairy dust', 'sparkle dust', 'dust'] },
      { text: 'Spell scrolls',  points: 30, aliases: ['spell scroll', 'spell scrolls', 'scroll', 'scrolls', 'spells'] },
      { text: 'Frog',           points: 15, aliases: ['frog', 'toad', 'a frog'] },
      { text: 'Dragon scale',   points: 10, aliases: ['dragon scale', 'dragon scales', 'scale'] },
      { text: 'Mysterious key', points: 5,  aliases: ['key', 'mysterious key', 'old key', 'magic key'] },
    ],
  },
  {
    question: 'If there was a gourmet cafe for dogs, what flavors might be on the menu?',
    answers: [
      { text: 'Beef',      points: 43, aliases: ['beef', 'steak', 'beef flavor'] },
      { text: 'Milkbone',  points: 25, aliases: ['milkbone', 'milk bone', 'dog biscuit', 'biscuit'] },
      { text: 'Bacon',     points: 13, aliases: ['bacon', 'bacon flavor'] },
      { text: 'Chicken',   points: 9,  aliases: ['chicken', 'chicken flavor'] },
      { text: 'Cat',       points: 8,  aliases: ['cat', 'cat flavor', 'kitty'] },
    ],
  },
  {
    question: 'What song do you think Santa Claus has as his ringtone?',
    answers: [
      { text: 'Jingle Bells',            points: 60, aliases: ['jingle bells', 'jingle bell'] },
      { text: 'Santa Claus Is Coming',   points: 14, aliases: ['santa claus is coming to town', 'santa claus is coming', 'he sees you when youre sleeping'] },
      { text: 'Rudolph The Red-Nosed Reindeer', points: 9, aliases: ['rudolph', 'rudolph the red nosed reindeer', 'red nosed reindeer'] },
      { text: 'Here Comes Santa Claus',  points: 8,  aliases: ['here comes santa claus', 'here comes santa'] },
      { text: 'Deck The Halls',          points: 5,  aliases: ['deck the halls', 'deck the hall', 'fa la la'] },
    ],
  },
  {
    question: 'If an alien landed at Christmas, name a tradition that would be hard to explain',
    answers: [
      { text: 'Santa Claus',          points: 38, aliases: ['santa', 'santa claus', 'a man in a red suit', 'fat man in red'] },
      { text: 'Wrapping / Giving Gifts', points: 22, aliases: ['gifts', 'presents', 'wrapping gifts', 'giving gifts', 'exchange gifts'] },
      { text: 'Tree Inside The House', points: 20, aliases: ['tree', 'christmas tree', 'tree in the house', 'tree inside', 'putting up a tree'] },
      { text: 'Caroling',             points: 8,  aliases: ['caroling', 'carol', 'singing carols', 'christmas carols'] },
      { text: 'Mistletoe',            points: 7,  aliases: ['mistletoe', 'kiss under mistletoe', 'kissing under mistletoe'] },
    ],
  },
  {
    question: 'Name something Cinderella would have a hard time doing in her glass slippers',
    answers: [
      { text: 'Running',      points: 54, aliases: ['run', 'running', 'sprint', 'sprinting'] },
      { text: 'Tap dancing',  points: 17, aliases: ['tap dance', 'tap dancing', 'dance', 'dancing'] },
      { text: 'Walking',      points: 13, aliases: ['walk', 'walking'] },
      { text: 'Mopping',      points: 7,  aliases: ['mop', 'mopping', 'clean the floor'] },
      { text: 'Jumping',      points: 6,  aliases: ['jump', 'jumping', 'leap'] },
    ],
  },
  {
    question: 'If you had to be locked inside a building for a year, which would you choose?',
    answers: [
      { text: 'Shopping mall',    points: 31, aliases: ['mall', 'shopping mall', 'shopping center', 'shopping centre'] },
      { text: 'Restaurant',       points: 26, aliases: ['restaurant', 'a restaurant'] },
      { text: 'Grocery store',    points: 23, aliases: ['grocery store', 'supermarket', 'grocery'] },
      { text: 'Home',             points: 12, aliases: ['home', 'my house', 'house'] },
      { text: 'Hotel',            points: 7,  aliases: ['hotel', 'a hotel'] },
    ],
  },
  {
    question: 'Name something a soldier took to kindergarten that they wouldn\'t take to training',
    answers: [
      { text: 'Blankie',    points: 36, aliases: ['blankie', 'blanket', 'security blanket', 'blanky'] },
      { text: 'Crayons',    points: 21, aliases: ['crayons', 'crayon', 'colored pencils', 'art supplies'] },
      { text: 'Lunchbox',   points: 15, aliases: ['lunchbox', 'lunch box', 'lunch bag'] },
      { text: 'Teddy bear', points: 12, aliases: ['teddy bear', 'stuffed animal', 'teddy', 'stuffed toy'] },
      { text: 'A parent',   points: 10, aliases: ['parent', 'a parent', 'mom', 'dad', 'mommy', 'daddy'] },
    ],
  },
  {
    question: 'Tell me an activity you might do to prove you aren\'t afraid of heights',
    answers: [
      { text: 'Skydive',       points: 43, aliases: ['skydive', 'sky dive', 'skydiving', 'parachute', 'jump out of a plane'] },
      { text: 'Bungee jump',   points: 26, aliases: ['bungee jump', 'bungee jumping', 'bungee'] },
      { text: 'Rock climb',    points: 12, aliases: ['rock climb', 'rock climbing', 'climb a mountain', 'mountain climb'] },
      { text: 'Climb a ladder', points: 6, aliases: ['climb a ladder', 'ladder', 'go up a ladder'] },
      { text: 'Paraglide',     points: 5,  aliases: ['paraglide', 'paragliding', 'hang glide', 'hang gliding'] },
    ],
  },
  {
    question: 'Name a place where the average person wouldn\'t last a day',
    answers: [
      { text: 'The jungle',      points: 43, aliases: ['jungle', 'the jungle', 'rainforest', 'amazon'] },
      { text: 'The desert',      points: 24, aliases: ['desert', 'the desert', 'sahara'] },
      { text: 'The military',    points: 13, aliases: ['military', 'army', 'boot camp', 'the army'] },
      { text: 'Frozen tundra',   points: 11, aliases: ['frozen tundra', 'tundra', 'arctic', 'north pole', 'antarctica'] },
      { text: 'Outer space',     points: 6,  aliases: ['outer space', 'space', 'in space'] },
    ],
  },
  {
    question: 'Name a place where people hope not to have a baby seated near them',
    answers: [
      { text: 'Airplane',        points: 39, aliases: ['airplane', 'plane', 'on a plane', 'flight'] },
      { text: 'Movie theater',   points: 23, aliases: ['movie', 'movies', 'movie theater', 'cinema', 'movie theatre'] },
      { text: 'Restaurant',      points: 17, aliases: ['restaurant', 'a restaurant'] },
      { text: 'Bus',             points: 8,  aliases: ['bus', 'on the bus'] },
      { text: 'Place of worship', points: 8, aliases: ['church', 'place of worship', 'temple', 'mosque'] },
    ],
  },
  {
    question: 'What might a hitchhiker bring to seem less dangerous?',
    answers: [
      { text: 'A puppy',     points: 36, aliases: ['puppy', 'dog', 'a puppy', 'a dog', 'cute dog'] },
      { text: 'A child',     points: 37, aliases: ['child', 'a child', 'baby', 'kid', 'a baby'] },
      { text: 'Teddy bear',  points: 8,  aliases: ['teddy bear', 'stuffed animal', 'teddy'] },
      { text: 'ID',          points: 3,  aliases: ['id', 'identification', 'id card'] },
      { text: 'A smile',     points: 3,  aliases: ['smile', 'a smile', 'friendly smile'] },
    ],
  },

  // ── Kids-Specific ──────────────────────────────────────────────────────────
  {
    question: 'Name something kids do with snow that their parents don\'t',
    answers: [
      { text: 'Eat it',           points: 34, aliases: ['eat it', 'eat snow', 'eat the snow'] },
      { text: 'Throw snowballs',  points: 21, aliases: ['snowballs', 'throw snowballs', 'snowball fight'] },
      { text: 'Make snow angels', points: 16, aliases: ['snow angels', 'make snow angels', 'snow angel'] },
      { text: 'Build a snowman',  points: 15, aliases: ['snowman', 'build a snowman', 'make a snowman'] },
      { text: 'Sledding',         points: 9,  aliases: ['sled', 'sledding', 'go sledding', 'slide on snow'] },
    ],
  },
  {
    question: 'Name something kids do with bad test papers',
    answers: [
      { text: 'Throw it away',  points: 43, aliases: ['throw it away', 'trash it', 'throw away', 'bin it', 'toss it'] },
      { text: 'Hide it',        points: 15, aliases: ['hide it', 'hide the paper', 'hide it from parents'] },
      { text: 'Rip it up',      points: 10, aliases: ['rip it', 'rip it up', 'tear it up', 'shred it'] },
      { text: 'Change the grade', points: 5, aliases: ['change grade', 'change the grade', 'alter it', 'forge it'] },
      { text: 'Cry',            points: 5,  aliases: ['cry', 'cry about it', 'sob'] },
    ],
  },
  {
    question: 'Name an article of clothing that children are always losing',
    answers: [
      { text: 'Socks',   points: 47, aliases: ['sock', 'socks'] },
      { text: 'Shoes',   points: 18, aliases: ['shoe', 'shoes', 'sneakers'] },
      { text: 'Gloves',  points: 15, aliases: ['glove', 'gloves', 'mittens', 'mitten'] },
      { text: 'Hat',     points: 9,  aliases: ['hat', 'beanie', 'cap'] },
      { text: 'Jacket',  points: 7,  aliases: ['jacket', 'coat', 'hoodie'] },
    ],
  },
  {
    question: 'Other than clothes, name something a kid might outgrow',
    answers: [
      { text: 'Toys',       points: 48, aliases: ['toy', 'toys'] },
      { text: 'Bed',        points: 28, aliases: ['bed', 'crib', 'their bed'] },
      { text: 'Hairstyle',  points: 13, aliases: ['hairstyle', 'hair style', 'hair'] },
      { text: 'Bike',       points: 5,  aliases: ['bike', 'bicycle', 'their bike'] },
      { text: 'Bad habits', points: 5,  aliases: ['habits', 'bad habits', 'phase'] },
    ],
  },
  {
    question: 'Name something a kid might do to get out of gym class',
    answers: [
      { text: 'Fake being sick',    points: 48, aliases: ['fake sick', 'pretend to be sick', 'fake illness', 'act sick'] },
      { text: 'Get injured',        points: 19, aliases: ['get injured', 'fake injury', 'fake an injury', 'injury', 'hurt themselves'] },
      { text: 'Doctor\'s note',     points: 9,  aliases: ['doctors note', 'doctor note', 'bring a note', 'note from doctor'] },
      { text: 'Skip class',         points: 8,  aliases: ['skip class', 'skip', 'skip gym', 'not show up'] },
      { text: 'Forget gym clothes', points: 5,  aliases: ['forget gym clothes', 'no gym clothes', 'forgot clothes', 'no uniform'] },
    ],
  },
  {
    question: 'Name something kids are taught about Abraham Lincoln',
    answers: [
      { text: '16th President',  points: 56, aliases: ['president', '16th president', 'he was president', 'president of america'] },
      { text: 'He was honest',   points: 23, aliases: ['honest', 'honest abe', 'he was honest', 'honesty'] },
      { text: 'Very tall',       points: 7,  aliases: ['tall', 'very tall', 'he was tall'] },
      { text: 'Freed the slaves', points: 6, aliases: ['freed slaves', 'freed the slaves', 'abolitionist', 'ended slavery'] },
      { text: 'Had a big beard', points: 5,  aliases: ['beard', 'big beard', 'stovepipe hat', 'tall hat', 'hat'] },
    ],
  },
  {
    question: 'What might a kid get in trouble for writing on?',
    answers: [
      { text: 'The wall',     points: 51, aliases: ['wall', 'the wall', 'walls'] },
      { text: 'School desk',  points: 30, aliases: ['desk', 'school desk', 'their desk', 'a desk'] },
      { text: 'Their clothes', points: 6, aliases: ['clothes', 'their clothes', 'shirt', 'pants'] },
      { text: 'Their skin',   points: 3,  aliases: ['skin', 'their skin', 'their arm', 'their hand', 'body'] },
      { text: 'A car',        points: 3,  aliases: ['car', 'a car', 'the car'] },
    ],
  },
  {
    question: 'What might a child bring to summer camp in case they get homesick?',
    answers: [
      { text: 'Family photo',  points: 36, aliases: ['family photo', 'photo', 'picture', 'family picture', 'photos'] },
      { text: 'Teddy bear',    points: 28, aliases: ['teddy bear', 'stuffed animal', 'teddy', 'stuffed toy'] },
      { text: 'Blanket',       points: 23, aliases: ['blanket', 'their blanket', 'security blanket', 'blankie'] },
      { text: 'Pillow',        points: 6,  aliases: ['pillow', 'their pillow'] },
      { text: 'Cell phone',    points: 4,  aliases: ['phone', 'cell phone', 'mobile phone'] },
    ],
  },
  {
    question: 'What\'s the best ice cream topping?',
    answers: [
      { text: 'Chocolate syrup', points: 35, aliases: ['chocolate syrup', 'chocolate sauce', 'hot fudge', 'chocolate'] },
      { text: 'Sprinkles',       points: 25, aliases: ['sprinkles', 'rainbow sprinkles', 'jimmies'] },
      { text: 'Whipped cream',   points: 20, aliases: ['whipped cream', 'whip cream', 'cream'] },
      { text: 'Cherry',          points: 10, aliases: ['cherry', 'cherries', 'a cherry'] },
      { text: 'Nuts',            points: 10, aliases: ['nuts', 'peanuts', 'crushed nuts', 'walnuts'] },
    ],
  },
  {
    question: 'Name a reason why a kid might not go trick-or-treating',
    answers: [
      { text: 'Too scared',          points: 46, aliases: ['scared', 'too scared', 'afraid', 'frightened', 'fear'] },
      { text: 'Sick',                points: 24, aliases: ['sick', 'ill', 'not feeling well'] },
      { text: 'Too old / too young', points: 23, aliases: ['too old', 'too young', 'baby', 'grown up', 'age'] },
      { text: 'No costume',          points: 3,  aliases: ['no costume', 'forgot costume', 'nothing to wear'] },
      { text: 'Bad weather',         points: 3,  aliases: ['bad weather', 'raining', 'storm', 'too cold'] },
    ],
  },
  {
    question: 'Name something that might come out of your nose when you laugh',
    answers: [
      { text: 'Snot',  points: 48, aliases: ['snot', 'boogers', 'mucus', 'booger'] },
      { text: 'Milk',  points: 38, aliases: ['milk', 'drink', 'liquid'] },
      { text: 'Water', points: 5,  aliases: ['water'] },
      { text: 'Soda',  points: 4,  aliases: ['soda', 'soda pop', 'juice', 'pop'] },
      { text: 'Air',   points: 3,  aliases: ['air', 'breath', 'a snort', 'snort'] },
    ],
  },
  {
    question: 'Name a food parents are afraid to give kids because it\'s so messy',
    answers: [
      { text: 'Pasta / Spaghetti', points: 38, aliases: ['pasta', 'spaghetti', 'noodles', 'mac and cheese', 'macaroni'] },
      { text: 'Ice cream',         points: 28, aliases: ['ice cream', 'icecream', 'popsicle'] },
      { text: 'Chocolate',         points: 22, aliases: ['chocolate', 'dessert', 'chocolate cake', 'brownies'] },
      { text: 'Sloppy Joe',        points: 5,  aliases: ['sloppy joe', 'sloppy joes'] },
      { text: 'Pizza',             points: 4,  aliases: ['pizza'] },
    ],
  },
  {
    question: 'Name a job you might have if you worked at Disney World',
    answers: [
      { text: 'Costume character', points: 35, aliases: ['costume character', 'character', 'mickey mouse', 'dress as a character', 'mascot'] },
      { text: 'Ride operator',     points: 26, aliases: ['ride operator', 'operate rides', 'ride attendant'] },
      { text: 'Stage performer',   points: 14, aliases: ['stage performer', 'performer', 'entertainer', 'show performer'] },
      { text: 'Ticket seller',     points: 10, aliases: ['ticket seller', 'ticket taker', 'sell tickets', 'gate attendant'] },
      { text: 'Food vendor',       points: 8,  aliases: ['food vendor', 'sell food', 'food stand', 'snack stand'] },
    ],
  },

  // ── Animals & Food ─────────────────────────────────────────────────────────
  {
    question: 'Name an animal you would find in the ocean but not in a pond',
    answers: [
      { text: 'Shark',    points: 44, aliases: ['shark', 'sharks'] },
      { text: 'Whale',    points: 24, aliases: ['whale', 'whales', 'blue whale'] },
      { text: 'Dolphin',  points: 16, aliases: ['dolphin', 'dolphins'] },
      { text: 'Octopus',  points: 7,  aliases: ['octopus', 'octopi', 'squid'] },
      { text: 'Seal',     points: 6,  aliases: ['seal', 'seals', 'sea lion'] },
    ],
  },
  {
    question: 'Name a fruit that you squeeze to see if it\'s ripe',
    answers: [
      { text: 'Orange',  points: 48, aliases: ['orange', 'oranges'] },
      { text: 'Peach',   points: 16, aliases: ['peach', 'peaches'] },
      { text: 'Melon',   points: 16, aliases: ['melon', 'watermelon', 'cantaloupe', 'honeydew'] },
      { text: 'Tomato',  points: 9,  aliases: ['tomato', 'tomatoes'] },
      { text: 'Lemon',   points: 8,  aliases: ['lemon', 'lemons', 'lime'] },
    ],
  },
  {
    question: 'Tell me a food that people often slurp while eating',
    answers: [
      { text: 'Soup',      points: 62, aliases: ['soup', 'chicken soup', 'noodle soup'] },
      { text: 'Spaghetti', points: 27, aliases: ['spaghetti', 'pasta', 'noodles', 'ramen'] },
      { text: 'Cereal',    points: 4,  aliases: ['cereal', 'milk and cereal'] },
      { text: 'Ice cream', points: 3,  aliases: ['ice cream', 'milkshake', 'shake'] },
      { text: 'Jell-O',    points: 3,  aliases: ['jello', 'jell-o', 'gelatin', 'jelly'] },
    ],
  },
  {
    question: 'Name a food that dogs love just as much as humans do',
    answers: [
      { text: 'Steak',     points: 48, aliases: ['steak', 'beef'] },
      { text: 'Chicken',   points: 14, aliases: ['chicken', 'fried chicken'] },
      { text: 'Bread',     points: 13, aliases: ['bread', 'toast'] },
      { text: 'Hamburger', points: 13, aliases: ['hamburger', 'burger', 'cheeseburger'] },
      { text: 'Cheese',    points: 8,  aliases: ['cheese'] },
    ],
  },
  {
    question: 'Tell me something people do with horses, but no other farm animals',
    answers: [
      { text: 'Ride them',         points: 54, aliases: ['ride', 'ride them', 'horseback ride', 'horseback riding'] },
      { text: 'Race them',         points: 21, aliases: ['race', 'race them', 'horse race', 'racing'] },
      { text: 'Brush / groom them', points: 11, aliases: ['brush', 'groom', 'brush them', 'groom them', 'brushing'] },
      { text: 'Train / show them', points: 5,  aliases: ['train', 'show', 'train them', 'show them', 'horse show'] },
      { text: 'Change their shoes', points: 3, aliases: ['horseshoes', 'change shoes', 'shoe them', 'put shoes on', 'horseshoe'] },
    ],
  },

  // ── Everyday Observation ───────────────────────────────────────────────────
  {
    question: 'Name a smell you associate with fall',
    answers: [
      { text: 'Fallen leaves',  points: 46, aliases: ['leaves', 'fallen leaves', 'leaf pile', 'autumn leaves'] },
      { text: 'Rain',           points: 20, aliases: ['rain', 'rain smell', 'wet grass'] },
      { text: 'Campfire',       points: 9,  aliases: ['campfire', 'fire', 'smoke', 'bonfire'] },
      { text: 'Pumpkin pie',    points: 9,  aliases: ['pumpkin pie', 'pumpkin', 'pumpkin spice'] },
      { text: 'Apples',         points: 5,  aliases: ['apples', 'apple cider', 'apple pie', 'apple'] },
    ],
  },
  {
    question: 'Name something that grows without being watered',
    answers: [
      { text: 'Hair',   points: 28, aliases: ['hair', 'your hair'] },
      { text: 'Weeds',  points: 25, aliases: ['weed', 'weeds', 'grass', 'wild plants'] },
      { text: 'Cactus', points: 19, aliases: ['cactus', 'cacti', 'succulent'] },
      { text: 'People', points: 17, aliases: ['people', 'children', 'kids', 'humans', 'babies'] },
      { text: 'Nails',  points: 3,  aliases: ['nails', 'fingernails', 'toenails'] },
    ],
  },
  {
    question: 'Name something in your house that has to be changed from time to time',
    answers: [
      { text: 'Sheets / bedding', points: 41, aliases: ['sheets', 'bedding', 'bed sheets', 'bed linens'] },
      { text: 'Light bulb',       points: 30, aliases: ['light bulb', 'lightbulb', 'bulb'] },
      { text: 'Air filter',       points: 7,  aliases: ['air filter', 'filter', 'furnace filter'] },
      { text: 'Batteries',        points: 7,  aliases: ['batteries', 'battery'] },
      { text: 'Furniture / decor', points: 6, aliases: ['furniture', 'decor', 'rearrange', 'redecorate'] },
    ],
  },
  {
    question: 'Name something people do at the dinner table that\'s considered bad manners',
    answers: [
      { text: 'Burp',               points: 41, aliases: ['burp', 'burping', 'belch', 'belching'] },
      { text: 'Elbows on the table', points: 32, aliases: ['elbows on table', 'put elbows on table', 'elbows'] },
      { text: 'Talk with mouth full', points: 18, aliases: ['talk with mouth full', 'talk with food in mouth', 'speak with full mouth', 'mouth full'] },
      { text: 'Eat with hands',      points: 3,  aliases: ['eat with hands', 'use hands', 'no utensils'] },
      { text: 'Chew with mouth open', points: 3, aliases: ['chew with mouth open', 'open mouth chewing', 'chew loudly'] },
    ],
  },
  {
    question: 'Name something from home you might miss on vacation',
    answers: [
      { text: 'My pet',     points: 38, aliases: ['pet', 'my pet', 'dog', 'cat', 'my dog', 'my cat'] },
      { text: 'My bed',     points: 30, aliases: ['bed', 'my bed', 'my own bed', 'pillow'] },
      { text: 'Family',     points: 11, aliases: ['family', 'my family', 'parents', 'siblings'] },
      { text: 'TV',         points: 9,  aliases: ['tv', 'television', 'my tv', 'shows'] },
      { text: 'My computer', points: 7, aliases: ['computer', 'my computer', 'laptop', 'gaming'] },
    ],
  },
  {
    question: 'Name a place people go for peace and quiet',
    answers: [
      { text: 'Library',   points: 48, aliases: ['library', 'the library'] },
      { text: 'Park',      points: 16, aliases: ['park', 'the park'] },
      { text: 'Bedroom',   points: 13, aliases: ['bedroom', 'my room', 'my bedroom', 'room'] },
      { text: 'Beach',     points: 7,  aliases: ['beach', 'the beach', 'ocean'] },
      { text: 'Church',    points: 14, aliases: ['church', 'temple', 'place of worship'] },
    ],
  },
  {
    question: 'Name a board game that takes a long time to play',
    answers: [
      { text: 'Monopoly', points: 42, aliases: ['monopoly'] },
      { text: 'Chess',    points: 19, aliases: ['chess'] },
      { text: 'Scrabble', points: 15, aliases: ['scrabble'] },
      { text: 'Risk',     points: 10, aliases: ['risk'] },
      { text: 'The Game of Life', points: 9, aliases: ['life', 'game of life', 'the game of life'] },
    ],
  },
  {
    question: 'Name something people do while riding a rollercoaster',
    answers: [
      { text: 'Scream',        points: 43, aliases: ['scream', 'screaming', 'yell', 'yelling', 'shout'] },
      { text: 'Raise their arms', points: 32, aliases: ['raise arms', 'arms up', 'hands up', 'raise hands'] },
      { text: 'Get sick',      points: 13, aliases: ['get sick', 'throw up', 'vomit', 'feel sick', 'barf'] },
      { text: 'Laugh',         points: 4,  aliases: ['laugh', 'laughing'] },
      { text: 'Close their eyes', points: 4, aliases: ['close eyes', 'shut eyes', 'eyes closed', 'close their eyes'] },
    ],
  },
  {
    question: 'What do you do when you want to sing along but don\'t know the words?',
    answers: [
      { text: 'Hum',              points: 66, aliases: ['hum', 'humming', 'la la la'] },
      { text: 'Mumble',           points: 18, aliases: ['mumble', 'mumbling', 'murmur'] },
      { text: 'Pretend to know',  points: 6,  aliases: ['pretend', 'fake it', 'act like you know', 'lip sync badly'] },
      { text: 'Whistle',          points: 4,  aliases: ['whistle', 'whistling'] },
      { text: 'Lip sync',         points: 4,  aliases: ['lip sync', 'lip syncing', 'mouth the words'] },
    ],
  },
  {
    question: 'Name a profession that requires really good balance',
    answers: [
      { text: 'Tightrope walker', points: 29, aliases: ['tightrope walker', 'tightrope', 'tightrope walking'] },
      { text: 'Acrobat',         points: 25, aliases: ['acrobat', 'acrobatics'] },
      { text: 'Gymnast',         points: 17, aliases: ['gymnast', 'gymnastics'] },
      { text: 'Trapeze artist',  points: 13, aliases: ['trapeze artist', 'trapeze', 'circus performer'] },
      { text: 'Ballerina',       points: 11, aliases: ['ballerina', 'ballet dancer', 'ballet'] },
    ],
  },
  {
    question: 'Name something specific about Santa that scares some kids at the mall',
    answers: [
      { text: 'His big beard',   points: 49, aliases: ['beard', 'big beard', 'white beard', 'long beard'] },
      { text: 'His size',        points: 34, aliases: ['size', 'big', 'large', 'he is big', 'his size'] },
      { text: 'His laugh',       points: 8,  aliases: ['laugh', 'ho ho ho', 'loud laugh', 'hearty laugh', 'his laugh'] },
      { text: 'He\'s a stranger', points: 5, aliases: ['stranger', 'stranger danger', 'he is a stranger', 'unknown person'] },
      { text: 'His deep voice',  points: 3,  aliases: ['deep voice', 'loud voice', 'voice', 'scary voice'] },
    ],
  },

  // ── Holiday-Themed ─────────────────────────────────────────────────────────
  {
    question: 'Name something people do in December to get in the holiday spirit',
    answers: [
      { text: 'Decorate',         points: 55, aliases: ['decorate', 'put up decorations', 'decorating', 'christmas decorations'] },
      { text: 'Buy / wrap gifts', points: 26, aliases: ['buy gifts', 'buy presents', 'shop', 'shopping', 'wrap gifts', 'gift shopping'] },
      { text: 'Sing carols',      points: 7,  aliases: ['sing carols', 'caroling', 'christmas carols', 'singing'] },
      { text: 'Put up the tree',  points: 6,  aliases: ['put up tree', 'christmas tree', 'decorate tree', 'get a tree'] },
      { text: 'Listen to music',  points: 5,  aliases: ['listen to music', 'christmas music', 'holiday music', 'play music'] },
    ],
  },
  {
    question: 'Other than Christmas, name an occasion people decorate their house for',
    answers: [
      { text: 'Halloween',     points: 43, aliases: ['halloween'] },
      { text: 'Easter',        points: 16, aliases: ['easter'] },
      { text: 'Thanksgiving',  points: 14, aliases: ['thanksgiving'] },
      { text: 'Birthday',      points: 9,  aliases: ['birthday', 'birthdays', 'birthday party'] },
      { text: 'Fourth of July', points: 7, aliases: ['fourth of july', '4th of july', 'independence day', 'july 4th'] },
    ],
  },
  {
    question: 'What do a lot of people eat on Christmas?',
    answers: [
      { text: 'Turkey',    points: 39, aliases: ['turkey', 'roast turkey'] },
      { text: 'Ham',       points: 31, aliases: ['ham', 'baked ham', 'honey ham'] },
      { text: 'Cookies',   points: 13, aliases: ['cookies', 'cookie', 'christmas cookies'] },
      { text: 'Candy',     points: 7,  aliases: ['candy', 'sweets', 'candy cane', 'candy canes'] },
      { text: 'Fruitcake', points: 3,  aliases: ['fruitcake', 'fruit cake'] },
    ],
  },
  {
    question: 'Name something you know about the Easter Bunny',
    answers: [
      { text: 'Carries / hides eggs', points: 45, aliases: ['eggs', 'hides eggs', 'carries eggs', 'easter eggs', 'egg hunt'] },
      { text: 'Hops',                 points: 15, aliases: ['hops', 'hopping', 'bounces', 'jumps'] },
      { text: 'Some don\'t believe',  points: 15, aliases: ['not real', 'some dont believe', 'made up', 'fake', 'not everyone believes'] },
      { text: 'White / fluffy',       points: 15, aliases: ['white', 'fluffy', 'white rabbit', 'big rabbit', 'bunny'] },
      { text: 'Brings candy',         points: 6,  aliases: ['brings candy', 'candy', 'chocolate eggs', 'treats'] },
    ],
  },
  {
    question: 'What complaints do people have about the Christmas holiday?',
    answers: [
      { text: 'It\'s too expensive',  points: 27, aliases: ['expensive', 'too expensive', 'costs too much', 'money', 'cost'] },
      { text: 'Nosy relatives',       points: 24, aliases: ['relatives', 'nosy relatives', 'annoying family', 'pesky relatives', 'family drama'] },
      { text: 'Traffic / traveling',  points: 20, aliases: ['traffic', 'traveling', 'travel', 'long drive', 'airport'] },
      { text: 'Crowds',               points: 13, aliases: ['crowds', 'too crowded', 'busy stores', 'packed'] },
      { text: 'Too much food',        points: 10, aliases: ['too much food', 'overeating', 'gaining weight', 'holiday food', 'eating too much'] },
    ],
  },
  {
    question: 'Which part of holiday prep do you always leave to the last minute?',
    answers: [
      { text: 'Shopping',      points: 42, aliases: ['shopping', 'gift shopping', 'buying gifts', 'last minute shopping'] },
      { text: 'Cooking',       points: 22, aliases: ['cooking', 'making food', 'baking', 'preparing food'] },
      { text: 'Cleaning',      points: 19, aliases: ['cleaning', 'tidying up', 'clean the house'] },
      { text: 'Wrapping gifts', points: 8, aliases: ['wrapping', 'wrap gifts', 'wrap presents', 'gift wrapping'] },
      { text: 'Decorating',    points: 8,  aliases: ['decorating', 'put up decorations', 'decorations'] },
    ],
  },
];

const MAX_STRIKES = 3;
const TOTAL_ROUNDS = 5;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FamilyFeud() {
  const questionOrder = useRef(shuffle(QUESTIONS.map((_, i) => i)).slice(0, TOTAL_ROUNDS));
  const [roundIndex, setRoundIndex] = useState(0);       // 0..TOTAL_ROUNDS-1
  const [revealed, setRevealed]     = useState([]);       // indices of revealed answers
  const [strikes, setStrikes]       = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const [input, setInput]           = useState('');
  const [feedback, setFeedback]     = useState(null);     // { text, good }
  const [phase, setPhase]           = useState('playing'); // 'playing' | 'round-end' | 'game-end'
  const [shakeBoard, setShakeBoard] = useState(false);
  const inputRef = useRef(null);

  const qIdx = questionOrder.current[roundIndex];
  const q    = QUESTIONS[qIdx];

  // ── Guess handler ──────────────────────────────────────────────────────────
  function handleGuess() {
    const guess = norm(input);
    if (!guess) return;
    setInput('');

    // Already revealed all?
    if (revealed.length === q.answers.length) return;

    // Check against answers
    let hit = -1;
    for (let i = 0; i < q.answers.length; i++) {
      if (revealed.includes(i)) continue;
      if (q.answers[i].aliases.some(a => norm(a) === guess)) {
        hit = i;
        break;
      }
    }

    if (hit !== -1) {
      const pts = q.answers[hit].points;
      const newRevealed = [...revealed, hit];
      const newRoundScore = roundScore + pts;
      setRevealed(newRevealed);
      setRoundScore(newRoundScore);
      setFeedback({ text: `+${pts} points! Great answer! 🎉`, good: true });
      launchConfetti(window.innerWidth / 2, 300, 18);

      if (newRevealed.length === q.answers.length) {
        endRound(newRoundScore, strikes);
      }
    } else {
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);
      setShakeBoard(true);
      setTimeout(() => setShakeBoard(false), 600);
      if (newStrikes >= MAX_STRIKES) {
        setFeedback({ text: 'Three strikes! Round over! ❌', good: false });
        endRound(roundScore, newStrikes);
      } else {
        setFeedback({ text: `Strike ${newStrikes}! Try again! ❌`, good: false });
      }
    }

    setTimeout(() => {
      setFeedback(null);
      inputRef.current?.focus();
    }, 1600);
  }

  function endRound(finalRoundScore, _strikes) {
    setTotalScore(prev => prev + finalRoundScore);
    setPhase('round-end');
    // Reveal all remaining answers
    setRevealed(q.answers.map((_, i) => i));
  }

  function nextRound() {
    const next = roundIndex + 1;
    if (next >= TOTAL_ROUNDS) {
      setPhase('game-end');
    } else {
      setRoundIndex(next);
      setRevealed([]);
      setStrikes(0);
      setRoundScore(0);
      setFeedback(null);
      setInput('');
      setPhase('playing');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  function restartGame() {
    questionOrder.current = shuffle(QUESTIONS.map((_, i) => i)).slice(0, TOTAL_ROUNDS);
    setRoundIndex(0);
    setRevealed([]);
    setStrikes(0);
    setTotalScore(0);
    setRoundScore(0);
    setFeedback(null);
    setInput('');
    setPhase('playing');
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  // ── Game-end screen ────────────────────────────────────────────────────────
  if (phase === 'game-end') {
    const maxPossible = QUESTIONS.slice(0, TOTAL_ROUNDS).reduce(
      (sum, q2) => sum + q2.answers.reduce((s, a) => s + a.points, 0), 0
    );
    const pct = Math.round((totalScore / maxPossible) * 100);
    const praise =
      pct >= 80 ? 'Amazing! You crushed it! 🏆' :
      pct >= 55 ? 'Great job! Well played! 🌟' :
      pct >= 30 ? 'Nice try! Play again to beat it! 😊' :
                  'Keep practicing — you\'ll get it! 💪';

    return (
      <div className="card card-red">
        <h2>📺 Family Feud!</h2>
        <div className="feud-gameover">
          <div className="feud-gameover-title">Game Over!</div>
          <div className="feud-gameover-score">{totalScore} points</div>
          <div className="feud-gameover-praise">{praise}</div>
          <button className="btn btn-red feud-play-again" onClick={restartGame}>
            Play Again! 🔄
          </button>
        </div>
      </div>
    );
  }

  // ── Main game UI ───────────────────────────────────────────────────────────
  return (
    <div className="card card-red">
      <h2>📺 Family Feud!</h2>

      {/* Score bar */}
      <div className="feud-score-bar">
        <span className="feud-score-label">Score: <strong>{totalScore + roundScore}</strong></span>
        <span className="feud-round-label">Round {roundIndex + 1} / {TOTAL_ROUNDS}</span>
      </div>

      {/* Question banner */}
      <div className="feud-question-banner">
        {q.question}
      </div>

      {/* Answer board */}
      <div className={`feud-board${shakeBoard ? ' feud-shake' : ''}`}>
        {q.answers.map((ans, i) => (
          <div key={i} className={`feud-answer-slot${revealed.includes(i) ? ' revealed' : ''}`}>
            {revealed.includes(i) ? (
              <>
                <span className="feud-ans-rank">#{i + 1}</span>
                <span className="feud-ans-text">{ans.text}</span>
                <span className="feud-ans-pts">{ans.points}</span>
              </>
            ) : (
              <span className="feud-ans-hidden">{i + 1}</span>
            )}
          </div>
        ))}
      </div>

      {/* Strikes */}
      <div className="feud-strikes">
        {[0, 1, 2].map(i => (
          <span key={i} className={`feud-strike${i < strikes ? ' active' : ''}`}>✗</span>
        ))}
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`feud-feedback${feedback.good ? ' good' : ' bad'}`}>
          {feedback.text}
        </div>
      )}

      {/* Input area */}
      {phase === 'playing' && (
        <>
          <div className="feud-input-row">
            <input
              ref={inputRef}
              className="feud-input"
              type="text"
              placeholder="Type your answer…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGuess()}
              autoFocus
            />
            <button className="btn btn-red" onClick={handleGuess}>
              Guess!
            </button>
          </div>
          <div className="feud-reveal-row">
            <button className="btn feud-reveal-btn" onClick={() => endRound(roundScore, strikes)}>
              Reveal Answers 👀
            </button>
          </div>
        </>
      )}

      {/* Round-end controls */}
      {phase === 'round-end' && (
        <div className="feud-round-end">
          <div className="feud-round-pts">You scored <strong>{roundScore}</strong> points this round!</div>
          <button className="btn btn-red feud-next-btn" onClick={nextRound}>
            {roundIndex + 1 < TOTAL_ROUNDS ? 'Next Question ▶' : 'See Final Score 🏆'}
          </button>
        </div>
      )}
    </div>
  );
}
