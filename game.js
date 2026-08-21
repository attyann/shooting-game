const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// キー入力状態
const keys = {};
window.addEventListener('keydown', (e) => { keys[e.code] = true; });
window.addEventListener('keyup', (e) => { keys[e.code] = false; });

// プレイヤーの設定
const player = {
  x: canvas.width / 2 - 15,
  y: canvas.height - 50,
  width: 30,
  height: 30,
  speed: 5,
  color: '#00ffcc'
};

// ゲーム状態データ
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;
let enemySpawnTimer = 0;

// メインループ
function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
    ctx.font = '20px sans-serif';
    ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2 + 40);
    return;
  }

  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// 状態更新処理
function update() {
  // プレイヤー移動
  if (keys['ArrowLeft'] && player.x > 0) player.x -= player.speed;
  if (keys['ArrowRight'] && player.x < canvas.width - player.width) player.x += player.speed;
  if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
  if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;

  // 弾の発射（Spaceキー）
  if (keys['Space']) {
    if (!player.lastShot || Date.now() - player.lastShot > 150) { // 連射制限
      bullets.push({
        x: player.x + player.width / 2 - 3,
        y: player.y,
        width: 6,
        height: 12,
        speed: 8,
        color: '#ffff00'
      });
      player.lastShot = Date.now();
    }
  }

  // 弾の移動処理
  bullets.forEach((bullet, index) => {
    bullet.y -= bullet.speed;
    if (bullet.y < 0) bullets.splice(index, 1);
  });

  // 敵の生成
  enemySpawnTimer++;
  if (enemySpawnTimer > 40) {
    enemies.push({
      x: Math.random() * (canvas.width - 30),
      y: -30,
      width: 30,
      height: 30,
      speed: 3,
      color: '#ff0055'
    });
    enemySpawnTimer = 0;
  }

  // 敵の移動と当たり判定
  enemies.forEach((enemy, eIndex) => {
    enemy.y += enemy.speed;

    // プレイヤーと敵の衝突判定
    if (
      player.x < enemy.x + enemy.width &&
      player.x + player.width > enemy.x &&
      player.y < enemy.y + enemy.height &&
      player.y + player.height > enemy.y
    ) {
      gameOver = true;
    }

    // 弾と敵の衝突判定
    bullets.forEach((bullet, bIndex) => {
      if (
        bullet.x < enemy.x + enemy.width &&
        bullet.x + bullet.width > enemy.x &&
        bullet.y < enemy.y + enemy.height &&
        bullet.y + bullet.height > enemy.y
      ) {
        enemies.splice(eIndex, 1);
        bullets.splice(bIndex, 1);
        score += 100;
      }
    });

    // 画面外に出た敵の削除
    if (enemy.y > canvas.height) {
      enemies.splice(eIndex, 1);
    }
  });
}

// 描画処理
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // プレイヤー描画
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // 弾描画
  bullets.forEach((bullet) => {
    ctx.fillStyle = bullet.color;
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  });

  // 敵描画
  enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  });

  // スコア表示
  ctx.fillStyle = 'white';
  ctx.font = '18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 10, 25);
}

// ゲームスタート
requestAnimationFrame(gameLoop);
