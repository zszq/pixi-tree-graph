import { Container } from '@pixi/display';
import { Circle, Rectangle } from '@pixi/math';
import { Sprite } from '@pixi/sprite';
import { Graphics } from '@pixi/graphics';
import { Texture } from '@pixi/core';
import '@pixi/mixin-get-child-by-name';
import { colorToPixi } from '../utils/color';
import { NodeStyle } from '../utils/style';
import { textToPixi, TextType } from '../utils/text';
import { TextureCache } from '../texture-cache';

const DELIMITER = '::';
const WHITE = 0xffffff;

const NODE_CIRCLE = 'NODE_CIRCLE';
const NODE_CIRCLE_BORDER = 'NODE_CIRCLE_BORDER';
const NODE_BTN = 'NODE_BTN';

export function createNode(nodeGfx: Container, nodeStyle: NodeStyle) {
  // nodeGfx -> nodeCircleBorder
  const nodeCircleBorder = new Sprite();
  nodeCircleBorder.name = NODE_CIRCLE_BORDER;
  nodeCircleBorder.anchor.set(0.5);
  nodeGfx.addChild(nodeCircleBorder);

  // nodeGfx -> nodeCircle
  const nodeCircle = new Sprite();
  nodeCircle.name = NODE_CIRCLE;
  nodeCircle.anchor.set(0.5);
  nodeGfx.addChild(nodeCircle);
}

export function updateNodeStyle(nodeGfx: Container, nodeStyle: NodeStyle, textureCache: TextureCache) {
  const nodeCircleTextureKey = [NODE_CIRCLE, nodeStyle.radius].join(DELIMITER);
  const nodeCircleTexture = textureCache.get(nodeCircleTextureKey, () => {
    const graphics = new Graphics();
    graphics.beginFill(WHITE);
    if (nodeStyle.shape === 'circle') {
      graphics.drawCircle(0, 0, nodeStyle.radius);
    }
    if (nodeStyle.shape === 'rect') {
      graphics.drawRoundedRect(0, 0, nodeStyle.width, nodeStyle.height, nodeStyle.radius);
    }
    return graphics;
  });

  const nodeCircleBorderTextureKey = [NODE_CIRCLE_BORDER, nodeStyle.radius, nodeStyle.border.width].join(DELIMITER);
  const nodeCircleBorderTexture = textureCache.get(nodeCircleBorderTextureKey, () => {
    const graphics = new Graphics();
    // graphics.lineStyle(nodeStyle.border.width, WHITE);
    graphics.beginFill(WHITE);
    if (nodeStyle.shape === 'circle') {
      graphics.drawCircle(0, 0, (nodeStyle.radius + nodeStyle.border.width));
    }
    if (nodeStyle.shape === 'rect') {
      graphics.drawRoundedRect(0, 0, nodeStyle.width + nodeStyle.border.width, nodeStyle.height + nodeStyle.border.width, nodeStyle.radius);
    }
    return graphics;
  });
  
  // nodeGfx -> nodeCircle
  // 如果nodeicon是图片直接遮盖nodeCircle，不再设置纹理，否则会出现底色锯齿边框
  // 但有图标的点的颜色深浅会失效？
  // if (nodeStyle.icon.type !== TextType.IMAGE) {
    const nodeCircle = nodeGfx.getChildByName!(NODE_CIRCLE) as Sprite;
    nodeCircle.texture = nodeCircleTexture;
    [nodeCircle.tint, nodeCircle.alpha] = colorToPixi(nodeStyle.color);
  // }

  // nodeGfx -> nodeCircleBorder
  const nodeCircleBorder = nodeGfx.getChildByName!(NODE_CIRCLE_BORDER) as Sprite;
  nodeCircleBorder.texture = nodeCircleBorderTexture;
  [nodeCircleBorder.tint, nodeCircleBorder.alpha] = colorToPixi(nodeStyle.border.color);
}

export function updateNodeVisibility(nodeGfx: Container, zoomStep: number) {
  // nodeGfx -> nodeCircleBorder
  const nodeCircleBorder = nodeGfx.getChildByName!(NODE_CIRCLE_BORDER) as Sprite;
  nodeCircleBorder.renderable = nodeCircleBorder.renderable && zoomStep >= 1;
}