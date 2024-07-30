const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

function preload() {
    this.load.image('sky', 'images/sky.png');
    this.load.image('ground', 'images/road&border.png');
    this.load.image('background_far', 'images/City1.png'); 
    this.load.image('background_near', 'images/boxes&container.png');
    this.load.spritesheet('player_idle', 'images/Player_idle.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('player_walk', 'images/Player_walk.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('player_jump', 'images/Player_jump.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('player_hurt', 'images/Player_hurt.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('player_dead', 'images/Player_dead.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('player_attack', 'images/Attack_2.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('enemy_idle', 'images/Idle.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('enemy_walk', 'images/Walk.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('enemy_attack', 'images/Attack_1.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('enemy_hurt', 'images/Hurt.png', { frameWidth: 32, frameHeight: 48 });
    this.load.spritesheet('enemy_dead', 'images/Dead.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    this.backgroundFar = this.add.tileSprite(0, 0, 800, 600, 'background_far').setOrigin(0, 0);
    this.backgroundNear = this.add.tileSprite(0, 0, 800, 600, 'background_near').setOrigin(0, 0);

    const platforms = this.physics.add.staticGroup();

    // Criação das plataformas
    platforms.create(200, 500, 'ground').setScale(1).refreshBody();
    platforms.create(600, 400, 'ground').setScale(1).refreshBody();

    // Criação do jogador
    this.player = this.physics.add.sprite(100, 450, 'player_idle');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, platforms);

    // Criação do inimigo
    this.enemies = this.physics.add.group({
        key: 'enemy_idle',
        repeat: 1,
        setXY: { x: 400, y: 300, stepX: 200 }
    });

    this.enemies.children.iterate((enemy) => {
        enemy.setBounce(0.2);
        enemy.setCollideWorldBounds(true);
        enemy.body.allowGravity = true;
    });

    this.physics.add.collider(this.enemies, platforms);
    this.physics.add.overlap(this.player, this.enemies, hitEnemy, null, this);

    // Animações do jogador
    this.anims.create({
        key: 'player_walk',
        frames: this.anims.generateFrameNumbers('player_walk', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'player_jump',
        frames: [{ key: 'player_jump', frame: 0 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'player_idle',
        frames: [{ key: 'player_idle', frame: 0 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'player_hurt',
        frames: [{ key: 'player_hurt', frame: 0 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'player_dead',
        frames: [{ key: 'player_dead', frame: 0 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'player_attack',
        frames: this.anims.generateFrameNumbers('player_attack', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: 0
    });

    // Animações do inimigo
    this.anims.create({
        key: 'enemy_walk',
        frames: this.anims.generateFrameNumbers('enemy_walk', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'enemy_attack',
        frames: this.anims.generateFrameNumbers('enemy_attack', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'enemy_idle',
        frames: [{ key: 'enemy_idle', frame: 0 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'enemy_hurt',
        frames: [{ key: 'enemy_hurt', frame: 0 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'enemy_dead',
        frames: [{ key: 'enemy_dead', frame: 0 }],
        frameRate: 20
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
}

function update() {
    // Atualiza o fundo de parallax
    const scrollSpeedFar = 0.5; // Velocidade de rolagem para o fundo distante
    const scrollSpeedNear = 1.0; // Velocidade de rolagem para o fundo próximo

    this.backgroundFar.tilePositionX += this.cursors.right.isDown ? scrollSpeedFar : this.cursors.left.isDown ? -scrollSpeedFar : 0;
    this.backgroundNear.tilePositionX += this.cursors.right.isDown ? scrollSpeedNear : this.cursors.left.isDown ? -scrollSpeedNear : 0;

    // Lógica do jogador
    if (this.cursors.left.isDown) {
        this.player.setVelocityX(-160);
        this.player.setScale(-1, 1); // Espelha o sprite horizontalmente
        this.player.anims.play('player_walk', true);
    } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(160);
        this.player.setScale(1, 1); // Define a escala normal
        this.player.anims.play('player_walk', true);
    } else {
        this.player.setVelocityX(0);
        this.player.anims.play('player_idle', true);
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-330);
        this.player.anims.play('player_jump', true);
    }

    if (this.attackKey.isDown) {
        if (this.player.anims.currentAnim.key !== 'player_attack') {
            this.player.anims.play('player_attack', true);
            attackEnemies(this);
        }
    }

    // Atualiza a animação dos inimigos
    this.enemies.children.iterate((enemy) => {
        if (enemy.body.velocity.x !== 0) {
            enemy.anims.play('enemy_walk', true);

            // Espelhar o inimigo com base na direção do movimento
            if (enemy.body.velocity.x > 0) {
                enemy.setScale(1, 1); // Normal
            } else if (enemy.body.velocity.x < 0) {
                enemy.setScale(-1, 1); // Espelhado
            }
        } else {
            enemy.anims.play('enemy_idle', true);
        }
    });

    // Patrulha dos inimigos
    this.enemies.children.iterate((enemy) => {
        if (enemy.body.velocity.x === 0) {
            enemy.setVelocityX(100); // Move o inimigo para a direita
        } else if (enemy.body.velocity.x === 100) {
            enemy.setVelocityX(-100); // Move o inimigo para a esquerda
        }
    });
}

function attackEnemies(scene) {
    scene.enemies.children.iterate((enemy) => {
        if (scene.player.anims
