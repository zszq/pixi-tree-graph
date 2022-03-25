import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import '@pixi/mixin-get-child-by-name';
import { NodeStyle } from '../utils/style';
import { TextureCache } from '../texture-cache';

const DELIMITER = '::';
const NODE_BTN = 'NODE_BTN';

export function createNodeAttach(nodeAttachGfx: Container) {
  const nodeIcon = new Sprite();
  nodeIcon.name = NODE_BTN;
  nodeIcon.anchor.set(0.5);
  nodeAttachGfx.addChild(nodeIcon);
}

export function updateNodeAttachStyle(nodeAttachGfx: Container, nodeStyle: NodeStyle, textureCache: TextureCache) {
  const attachStyle = nodeStyle.attach;
  const nodeWidth = nodeStyle.width;
  // const nodeHeight = nodeStyle.height;
  const position = attachStyle.position;

  const nodeAttachTextureKey = [NODE_BTN, attachStyle.icon, attachStyle.iconWidth, attachStyle.iconHeight].join(DELIMITER);
  let nodeAttachTexture: Texture;

  if (textureCache.has(nodeAttachTextureKey)) {
    const nodeIconTexture = textureCache.getOnly(nodeAttachTextureKey)!;
    nodeAttachTexture = nodeIconTexture;
  } else {
    const nodeIconTexture = Texture.from(attachStyle.icon);
    textureCache.set(nodeAttachTextureKey, nodeIconTexture);
    nodeAttachTexture = nodeIconTexture;
  }

  const attachIcon = nodeAttachGfx.getChildByName!(NODE_BTN) as Sprite;
  attachIcon.texture = nodeAttachTexture;
  if (position == 'left') {
    attachIcon.x = -nodeWidth / 2 - attachStyle.iconWidth / 2;
  } else if (position == 'right') {
    attachIcon.x = nodeWidth / 2 + attachStyle.iconWidth / 2;
  }
}

export function updateNodeAttachVisibility(nodeAttachGfx: Container, zoomStep: number) {
  let childrens = nodeAttachGfx.children;
  childrens.forEach(sprite => {
    sprite.renderable = sprite.renderable && zoomStep >= 2;
  })
}
