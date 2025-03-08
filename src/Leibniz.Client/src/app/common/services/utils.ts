const toTypeId = function (type: string): number {
  switch (type) {
    case 'post':
      return 1;
    case 'link':
      return 2;
    case 'area':
      return 3;
    case 'author':
      return 4;
    case 'book':
      return 5;
    case 'period':
      return 6;
    case 'thesis':
      return 7;
    case 'topic':
      return 8;
    case 'unknown':
      return 9;
  }
  return 9;
};

function copyToClipboard(text: string) {
  const selBox = document.createElement('textarea');
  selBox.style.position = 'fixed';
  selBox.style.left = '0';
  selBox.style.top = '0';
  selBox.style.opacity = '0';
  selBox.value = text;
  document.body.appendChild(selBox);
  selBox.focus();
  selBox.select();
  document.execCommand('copy');
  document.body.removeChild(selBox);
}



export default { toTypeId, copyToClipboard };
