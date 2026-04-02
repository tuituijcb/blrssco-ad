#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 整合三个失败文件记录中的所有游戏
const allFailedGames = [
  // 来自 failed-uploads-2025_06_30_13_28_39.txt (12个游戏)
  'color-tunnel',
  'ClassicSolitaire', 
  'cubito',
  'DD-2K-Shoot',
  'dd-alpha-balls',
  'dd-pizza-pickup',
  'dd-sand-sort-puzzle',
  'DiamondDungeon',
  'donut-box',
  'DoctorTeeth',
  'drift-dudes',
  'emoji-flow',
  
  // 来自 failed-uploads-2025_06_30_17_56_26.txt (38个游戏)
  'filling-lines',
  'fill-pix',
  'FindTheDifferenceFovere',
  'FindTheDifferenceBest',
  'fire-up',
  'food-puzzle',
  'FlappyShooter',
  'flip-the-gun',
  'Find_Difference_2024',
  'ForgottenTreasure2',
  'fools-match',
  'free-birds',
  'Freekick_Football_3D',
  'fruitmas',
  'Frontline',
  'FruitCubeBlast',
  'fruits-slot-machine',
  'Galaxy_War',
  'galaxy-toops',
  'Galaxy_Attack',
  'Galaga_Assault',
  'garden-bloom',
  'happy-connect',
  'GolfAdventures',
  'Hexagon_Block_Sort',
  'hexadungeon',
  'IdleExplorers',
  'Jewels_Blitz_6',
  'JewelPetsMatch',
  'JewelMagicXmas',
  'kids-coloring',
  'MarketSort',
  'match-shapes',
  'match-arena',
  'mini-golf',
  'Meteorite_Shooter',
  
  // 来自 failed-uploads-2025_06_30_21_58_56.txt (33个游戏)
  'neon-swing',
  'omino',
  'ocho',
  'onet-paradise',
  'PiratePoker',
  'pretty-tiles',
  'QuestBingo',
  'Quest21',
  'PuzzlePiecesMerge',
  'rope-color-sort-3d',
  'RoyalCrownBlast',
  'SavetheDoge',
  'ScrewNutsandBolts',
  'scooer_hero',
  'Space_Shooter',
  'SquArea',
  'SpotDiffers',
  'Spot-the-differences',
  'Stickman_hook_2',
  'SudokuPlus',
  'tendo',
  'taxi-pick-up',
  'tilejourney',
  'TilePuzzle',
  'tower-defense-mingling',
  'TotemiaCursedMarbles',
  'tiny-cars',
  'traffictom',
  'Train2048',
  'TrafficSurgery',
  'TripeaksSolitaire',
  'uncleahmed',
  'word-clues',
  'WordSearch',
  'words-of-wonders',
  'xmas-tiles'
];

// 去重并排序
const uniqueGames = [...new Set(allFailedGames)].sort();

// 失败记录
const failedUploads = [];
const successfulUploads = [];

console.log('🚀 统一重新上传失败游戏脚本');
console.log('='.repeat(60));
console.log(`📊 总计需要重新上传的游戏: ${uniqueGames.length} 个`);
console.log('='.repeat(60));

// 保存失败记录的函数
function saveFailedLog() {
  if (failedUploads.length === 0) return null;
  
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:\-T]/g, '_');
  const logFileName = `retry-failed-${timestamp}.txt`;
  
  let content = `# 重试上传失败记录\n`;
  content += `# 生成时间: ${new Date().toLocaleString()}\n`;
  content += `# 总失败数: ${failedUploads.length}\n`;
  content += `# 总成功数: ${successfulUploads.length}\n\n`;
  
  content += `## 失败的游戏:\n`;
  failedUploads.forEach((game, index) => {
    content += `${index + 1}. ${game.name} (退出码: ${game.code})\n`;
  });
  
  content += `\n## 成功的游戏:\n`;
  successfulUploads.forEach((game, index) => {
    content += `${index + 1}. ${game}\n`;
  });
  
  content += `\n## 重试失败游戏的命令:\n`;
  failedUploads.forEach(game => {
    content += `node upload-concurrent-games.cjs --single ${game.name}\n`;
  });
  
  fs.writeFileSync(logFileName, content, 'utf8');
  return logFileName;
}

// 上传单个游戏
function uploadGame(gameName, index) {
  return new Promise((resolve) => {
    console.log(`\n[${index + 1}/${uniqueGames.length}] 🎮 开始上传: ${gameName}`);
    
    const startTime = Date.now();
    // 使用项目根目录的上传脚本
    const scriptPath = path.join(__dirname, '..', 'upload-concurrent-games.cjs');
    const uploadProcess = spawn('node', [scriptPath, '--single', gameName], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..')  // 设置工作目录为项目根目录
    });

    uploadProcess.on('close', (code) => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      if (code === 0) {
        successfulUploads.push(gameName);
        console.log(`✅ 游戏 ${gameName} 上传成功 (耗时: ${duration}秒)`);
      } else {
        failedUploads.push({ name: gameName, code });
        console.log(`❌ 游戏 ${gameName} 上传失败 (退出码: ${code}, 耗时: ${duration}秒)`);
      }
      
      // 显示当前进度
      const completed = index + 1;
      const successRate = ((successfulUploads.length / completed) * 100).toFixed(1);
      console.log(`📈 进度: ${completed}/${uniqueGames.length} | 成功率: ${successRate}% | 成功: ${successfulUploads.length} | 失败: ${failedUploads.length}`);
      
      resolve();
    });

    uploadProcess.on('error', (error) => {
      failedUploads.push({ name: gameName, code: -1, error: error.message });
      console.log(`💥 游戏 ${gameName} 执行出错: ${error.message}`);
      resolve();
    });
  });
}

// 主函数
async function main() {
  console.log('\n📋 游戏列表预览:');
  uniqueGames.slice(0, 10).forEach((game, index) => {
    console.log(`  ${index + 1}. ${game}`);
  });
  if (uniqueGames.length > 10) {
    console.log(`  ... 还有 ${uniqueGames.length - 10} 个游戏`);
  }
  
  console.log('\n⏱️  预计总耗时: 约 2-4 小时');
  console.log('💡 提示: 可以随时用 Ctrl+C 中断，已完成的不会重复上传');
  console.log('\n🚀 开始批量上传...\n');
  
  const overallStartTime = Date.now();
  
  // 顺序上传所有游戏
  for (let i = 0; i < uniqueGames.length; i++) {
    await uploadGame(uniqueGames[i], i);
    
    // 每10个游戏显示一次详细统计
    if ((i + 1) % 10 === 0 || i === uniqueGames.length - 1) {
      console.log('\n' + '-'.repeat(50));
      console.log(`📊 阶段性统计 (已完成 ${i + 1}/${uniqueGames.length}):`);
      console.log(`✅ 成功: ${successfulUploads.length} 个`);
      console.log(`❌ 失败: ${failedUploads.length} 个`);
      console.log(`📈 成功率: ${((successfulUploads.length / (i + 1)) * 100).toFixed(1)}%`);
      
      if (failedUploads.length > 0) {
        console.log('❌ 最近失败的游戏:');
        failedUploads.slice(-3).forEach(fail => {
          console.log(`   - ${fail.name} (退出码: ${fail.code})`);
        });
      }
      console.log('-'.repeat(50));
    }
    
    // 添加短暂延迟避免系统过载
    if (i < uniqueGames.length - 1) {
      console.log('⏳ 等待 3 秒后继续...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  // 最终统计
  const totalDuration = Math.round((Date.now() - overallStartTime) / 1000 / 60);
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 批量上传完成！');
  console.log('='.repeat(60));
  console.log(`⏱️  总耗时: ${totalDuration} 分钟`);
  console.log(`📊 总游戏数: ${uniqueGames.length}`);
  console.log(`✅ 成功上传: ${successfulUploads.length} 个 (${((successfulUploads.length / uniqueGames.length) * 100).toFixed(1)}%)`);
  console.log(`❌ 上传失败: ${failedUploads.length} 个 (${((failedUploads.length / uniqueGames.length) * 100).toFixed(1)}%)`);
  
  // 保存失败记录
  const logFile = saveFailedLog();
  if (logFile) {
    console.log(`📄 失败记录已保存到: ${logFile}`);
  }
  
  if (successfulUploads.length > 0) {
    console.log('\n✅ 成功上传的游戏:');
    successfulUploads.slice(0, 10).forEach((game, index) => {
      console.log(`  ${index + 1}. ${game}`);
    });
    if (successfulUploads.length > 10) {
      console.log(`  ... 还有 ${successfulUploads.length - 10} 个`);
    }
  }
  
  if (failedUploads.length > 0) {
    console.log('\n❌ 上传失败的游戏:');
    failedUploads.forEach((fail, index) => {
      console.log(`  ${index + 1}. ${fail.name} (退出码: ${fail.code})`);
    });
    
    console.log('\n🔄 重试失败游戏的命令:');
    failedUploads.slice(0, 5).forEach(fail => {
      console.log(`node upload-concurrent-games.cjs --single ${fail.name}`);
    });
    if (failedUploads.length > 5) {
      console.log(`... 还有 ${failedUploads.length - 5} 个，详见日志文件`);
    }
  }
  
  console.log('='.repeat(60));
  
  if (failedUploads.length === 0) {
    console.log('🎉 所有游戏都上传成功！');
    process.exit(0);
  } else {
    console.log('⚠️  部分游戏上传失败，请检查日志并重试');
    process.exit(1);
  }
}

// 处理中断信号
process.on('SIGINT', () => {
  console.log('\n\n⚠️  收到中断信号，正在保存当前进度...');
  const logFile = saveFailedLog();
  if (logFile) {
    console.log(`📄 进度已保存到: ${logFile}`);
  }
  console.log('👋 程序已安全退出');
  process.exit(0);
});

// 运行脚本
main().catch(error => {
  console.error('💥 程序执行出错:', error);
  process.exit(1);
}); 