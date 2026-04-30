export const CLAMPED_CLAW_Z = {
    min: -0.75,
    max: 0.45,
};

export const CLAMPED_CLAW_X = {
    min: -0.82,
    max: 0.8,
};

export const JOYSTICK_MOVEMENT_SPEED = 0.32;
export const BALL_COUNT = 10;
export const BALL_COLLIDER_RADIUS = 0.155;
export const PICK_TARGET_Y = 2;
export const CARRIED_BALL_Y_OFFSET = 3.05;
export const PICK_DELAY_MS = 200;
export const MAX_ALIGNMENT_DISTANCE = 0.42;
export const GUARANTEE_READY_CHARGE = 9;
export const REVEAL_PULL_DURATION = 1.35;
export const REVEAL_FLASH_DURATION_MS = 560;
export const REVEAL_FRONT_CAMERA_POSITION = [0, 2.72, 3.08] as [number, number, number];
export const REVEAL_FRONT_CAMERA_TARGET = [0, 2.18, 0.1] as [number, number, number];
export const REWARD_DROP_ZONE = {
    minX: -0.9,
    maxX: -0.14,
    minY: -2,
    maxY: 1.52,
    minZ: 0.02,
    maxZ: 0.72,
};

export const REWARD_VARIANTS = [
    {
        colorKey: 'blue',
        label: '第 1 封信',
        message: '我好想妳，當我一個人的時候，我會抱著我的枕頭，把頭埋入其中，緊緊的擁抱著，感覺抱緊一點就可以感受到妳的溫度',
        accent: '#8bc8ff',
        glow: 'rgba(89, 181, 255, 0.74)',
    },
    {
        colorKey: 'green',
        label: '第 2 封信',
        message: '每天當醒來時，接到妳的電話是我一整天的動力，我思念妳，想知道妳在做甚麼，想要感受妳可愛的聲音，想要進入妳的回憶，想要將自己埋入妳的記憶中',
        accent: '#98e1bf',
        glow: 'rgba(108, 224, 172, 0.68)',
    },
    {
        colorKey: 'pink',
        label: '第 3 封信',
        message: '做飯時，我像個愛妻子的家庭主夫，我想像著這個就是我要做的愛妻便當，每一次我都好好地擺盤，大家問我為什麼要如此賣力，我想的是有一天我想要讓這頓飯，變成真正可以被所愛之人吃到',
        accent: '#ff9cc7',
        glow: 'rgba(255, 133, 194, 0.72)',
    },
    {
        colorKey: 'red',
        label: '第 4 封信',
        message: '妳是我的小公主，我想要好好的呵護妳，想要好好地跟妳相處，想要在某一天站出來保護妳，想要為妳遮風避雨',
        accent: '#ff9a97',
        glow: 'rgba(255, 111, 111, 0.7)',
    },
    {
        colorKey: 'yellow',
        label: '第 5 封信',
        message: '每次我們鬧不愉快，我的心其實都很沉重，但隔天事情解決我又覺得我們可以走得更久了，但讓妳傷心讓妳難過了，我其實都好捨不得',
        accent: '#ffe086',
        glow: 'rgba(255, 205, 97, 0.72)',
    },
    {
        colorKey: 'blue',
        label: '第 6 封信',
        message: '我好想要跟妳說我愛妳，好喜歡妳，一直說喜歡妳的時候不知不覺眼淚就像斷掉的珍珠一樣慢慢地滑落下來，好想讓妳聽到，好想讓妳知道，好想讓妳感受到我這份心意',
        accent: '#8bc8ff',
        glow: 'rgba(89, 181, 255, 0.74)',
    },
    {
        colorKey: 'green',
        label: '第 7 封信',
        message: '有時候我反應過激烈了，我聽到妳對於我們之間的不滿妳的不愉快，我就會很緊張，因為我內心知道我其實很多時候會做出愚蠢的事情，我的愚蠢傷害到了我最喜歡的人...我真的不知道該怎麼辦',
        accent: '#98e1bf',
        glow: 'rgba(108, 224, 172, 0.68)',
    },
    {
        colorKey: 'pink',
        label: '第 8 封信',
        message: '這段時間我因為考試很忙，不知不覺疏忽了很多事情，這不是藉口只是想讓我愛的人知道我意識到了，我會好好的去注意，但是我真的好喜歡妳...真的不能沒有妳',
        accent: '#ff9cc7',
        glow: 'rgba(255, 133, 194, 0.72)',
    },
    {
        colorKey: 'red',
        label: '第 9 封信',
        message: '之前總有說不完的話，我有想和妳有說不完的事情，我想要把說過的話再重複幾百遍，重複上萬次，就如同一聲聲的我愛妳，我真的很愛妳',
        accent: '#ff9a97',
        glow: 'rgba(255, 111, 111, 0.7)',
    },
    {
        colorKey: 'yellow',
        label: '第 10 封信',
        message: '希望我們可以一直好好的，希望未來的每一天都充滿著妳令人憐愛的身影，聽到就渾身充滿精神的聲音，希望可以好好地接住妳所有的曖昧，對我來說這一切都如同昨日般耐人回想。我想和妳幸福的一直一直走下去，緊緊的握住妳的小手，感受妳，喜歡妳',
        accent: '#ffe086',
        glow: 'rgba(255, 205, 97, 0.72)',
    },
] as const;

export const REWARD_TRAY_SLOTS = Array.from({ length: 24 }, (_, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2) % 2;
    const layer = Math.floor(index / 4);

    return [
        -0.38 + column * 0.18,
        1.72 + layer * 0.125,
        0.28 + row * 0.18,
    ] as [number, number, number];
});

export const MODEL_PATHS = {
    floor: '/floor.glb',
    clawMachine: '/clawMachine.glb',
    clawRest: '/clawRest.glb',
    clawRest1: '/clawRest1.glb',
    clawRest2: '/clawRest2.glb',
    clawRest3: '/clawRest3.glb',
    claw1: '/claw1.glb',
    claw2: '/claw2.glb',
    claw3: '/claw3.glb',
    blueBall: '/ball-blue.glb',
    greenBall: '/ball-green.glb',
    pinkBall: '/ball-pink.glb',
    redBall: '/ball-red.glb',
    yellowBall: '/ball-yellow.glb',
} as const;

export const PRIZE_POSITIONS = Array.from({ length: BALL_COUNT }, (_, index) => {
    const column = index % 5;
    const row = Math.floor(index / 5);
    const x = -0.34 + column * 0.28;
    const y = 2 + (index % 2) * 0.05;
    const z = -0.48 + row * 0.34;

    return [x, y, z] as [number, number, number];
});
