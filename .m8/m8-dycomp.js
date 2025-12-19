

// credit no-development-group/.m8



// Dynamic Self-Contained .m8 Generator
// Creates a single HTML file with adaptive compression based on tag frequency
// Usage: node m8-dynamic-self-contained.js input.html output.html

const fs = require('fs');
const path = require('path');

// Base attribute mapping (always useful)
const attrMap = {
  'class': 'c', 'id': 'i', 'style': 's', 'src': 'r',
  'href': 'h', 'alt': 'a', 'title': 't', 'type': 'y',
  'name': 'n', 'value': 'v', 'placeholder': 'p'
};

// Analyze tag frequency in HTML
function analyzeTagFrequency(html) {
  const tagPattern = /<\/?(\w+)\b[^>]*>/gi;
  const frequency = {};
  
  let match;
  while ((match = tagPattern.exec(html)) !== null) {
    const tag = match[1].toLowerCase();
    frequency[tag] = (frequency[tag] || 0) + 1;
  }
  
  return frequency;
}

// Build optimal tag mapping based on frequency and tag length
function buildOptimalMapping(frequency, maxMappings = 50) {
  // Calculate savings: frequency * tag_length
  // Longer, more frequent tags get priority
  const sorted = Object.entries(frequency)
    .map(([tag, count]) => ({
      tag,
      count,
      savings: count * tag.length // bigger = better
    }))
    .sort((a, b) => b.savings - a.savings)
    .slice(0, maxMappings);
  
  // Create compact numeric mapping
  const mapping = {};
  sorted.forEach((item, index) => {
    mapping[item.tag] = (index + 1).toString();
  });
  
  return mapping;
}

// Compress HTML using dynamic mapping
function compressToM8(html, tagMap) {
  // Remove whitespace between tags
  let compressed = html.replace(/>\s+</g, '><');
  
  // Compress opening tags with attributes
  compressed = compressed.replace(/<(\w+)([^>]*)>/g, (match, tag, attrs) => {
    const shortTag = tagMap[tag.toLowerCase()] || tag;
    let shortAttrs = attrs;
    for (const [long, short] of Object.entries(attrMap)) {
      const regex = new RegExp(`\\s${long}=`, 'g');
      shortAttrs = shortAttrs.replace(regex, ` ${short}=`);
    }
    return `<${shortTag}${shortAttrs}>`;
  });

  // Compress closing tags
  compressed = compressed.replace(/<\/(\w+)>/g, (match, tag) => {
    const shortTag = tagMap[tag.toLowerCase()] || tag;
    return `</${shortTag}>`;
  });

  return compressed;
}

// Escape HTML for embedding in script
function escapeForScript(html) {
  return html
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\r?\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');
}

// Encode tag mapping as compact string
function encodeMapping(tagMap) {
  // Create array where index = code - 1, value = tag
  const maxCode = Math.max(...Object.values(tagMap).map(Number));
  const tags = new Array(maxCode);
  
  for (const [tag, code] of Object.entries(tagMap)) {
    tags[parseInt(code) - 1] = tag;
  }
  
  return tags.join(',');
}

// Generate self-contained .m8 HTML file with dynamic compression
function generateSelfContained(originalHtml) {
  // Analyze and build optimal mapping
  const frequency = analyzeTagFrequency(originalHtml);
  const tagMap = buildOptimalMapping(frequency);
  
  // Compress using dynamic mapping
  const compressed = compressToM8(originalHtml, tagMap);
  const escaped = escapeForScript(compressed);
  const encodedMap = encodeMapping(tagMap);
  
  // Calculate statistics
  const originalSize = Buffer.byteLength(originalHtml);
  const compressedSize = Buffer.byteLength(compressed);
  const savingsPercent = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);

  // Self-extracting HTML template with dynamic decompressor
  const selfExtractingHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Loading...</title></head><body>
<script>
(function(){
const m8='${escaped}';
const tm='${encodedMap}'.split(',');
const a={'c':'class','i':'id','s':'style','r':'src','h':'href','a':'alt','t':'title','y':'type','n':'name','v':'value','p':'placeholder'};
function d(m,t){
let h=m.replace(/<(\\w+)([^>]*)>/g,function(match,tag,attrs){
const lt=t[tag-1]||tag;
let la=attrs;
for(const s in a){
const l=a[s];
const r=new RegExp('\\\\s'+s+'=','g');
la=la.replace(r,' '+l+'=');
}
return '<'+lt+la+'>';
});
h=h.replace(/<\\/(\\w+)>/g,function(match,tag){
const lt=t[tag-1]||tag;
return '</'+lt+'>';
});
return h;
}
const html=d(m8,tm);
const titleMatch=html.match(/<title[^>]*>([^<]*)<\\/title>/i);
if(titleMatch)document.title=titleMatch[1];
document.open();
document.write(html);
document.close();
})();
</script>
</body></html>`;

  return {
    html: selfExtractingHtml,
    stats: {
      originalSize,
      compressedSize,
      selfContainedSize: Buffer.byteLength(selfExtractingHtml),
      savingsPercent,
      tagMap,
      frequency,
      mappingSize: Buffer.byteLength(encodedMap)
    }
  };
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node m8-dynamic-self-contained.js <input.html> <output.html>');
    console.log('');
    console.log('Example:');
    console.log('  node m8-dynamic-self-contained.js index.source.html index.m8.html');
    console.log('');
    console.log('This creates a self-extracting HTML file with adaptive compression!');
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1];

  if (!fs.existsSync(inputFile)) {
    console.error(`Error: Input file '${inputFile}' not found`);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(60));
  console.log('Dynamic Self-Contained .m8 Generator');
  console.log('='.repeat(60));
  console.log(`Input:  ${inputFile}`);
  console.log(`Output: ${outputFile}`);
  console.log('');

  const originalHtml = fs.readFileSync(inputFile, 'utf8');
  const result = generateSelfContained(originalHtml);

  fs.writeFileSync(outputFile, result.html, 'utf8');

  console.log('✓ Generation complete!');
  console.log('');
  console.log('File Sizes:');
  console.log(`  Original HTML:      ${result.stats.originalSize.toLocaleString()} bytes`);
  console.log(`  Compressed .m8:     ${result.stats.compressedSize.toLocaleString()} bytes`);
  console.log(`  Mapping table:      ${result.stats.mappingSize.toLocaleString()} bytes`);
  console.log(`  Self-Contained:     ${result.stats.selfContainedSize.toLocaleString()} bytes`);
  console.log('');
  console.log('Compression Analysis:');
  console.log(`  Pure compression:   ${result.stats.savingsPercent}%`);
  const overhead = result.stats.selfContainedSize - result.stats.compressedSize;
  const netSavings = ((result.stats.originalSize - result.stats.selfContainedSize) / result.stats.originalSize * 100).toFixed(1);
  console.log(`  Decompressor size:  ${overhead.toLocaleString()} bytes`);
  console.log(`  Net savings:        ${netSavings}%`);
  console.log('');
  console.log('Top 10 Compressed Tags:');
  const topTags = Object.entries(result.stats.frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  topTags.forEach(([tag, count]) => {
    const code = result.stats.tagMap[tag] || 'N/A';
    console.log(`  <${tag}> → <${code}> (used ${count}x)`);
  });
  console.log('');
  console.log('Now open the file in a browser:');
  console.log(`  file://${path.resolve(outputFile)}`);
  console.log('='.repeat(60) + '\n');
}

// Export for use as module
module.exports = {
  analyzeTagFrequency,
  buildOptimalMapping,
  compressToM8,
  generateSelfContained
};