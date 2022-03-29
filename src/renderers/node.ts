import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Graphics } from '@pixi/graphics';
import { Texture } from '@pixi/core';
import '@pixi/mixin-get-child-by-name';
import { colorToPixi } from '../utils/color';
import { NodeStyle } from '../utils/style';
import { TextureCache } from '../texture-cache';
import { textToPixi } from '../utils/text';

const DELIMITER = '::';
const WHITE = 0xffffff;

const NODE_CIRCLE = 'NODE_CIRCLE';
const NODE_CIRCLE_BORDER = 'NODE_CIRCLE_BORDER';
const NODE_LABEL_TEXT = 'NODE_LABEL_TEXT';
const NODE_LABEL_BACKGROUND = 'NODE_LABEL_BACKGROUND';

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

  if (nodeStyle.label.show) {
    // labelBackground
    const nodeLabelBackground = new Sprite(Texture.WHITE);
    nodeLabelBackground.name = NODE_LABEL_BACKGROUND;
    nodeLabelBackground.anchor.set(0.5);
    nodeGfx.addChild(nodeLabelBackground);
    // labelText
    const nodeLabelText = new Sprite();
    nodeLabelText.name = NODE_LABEL_TEXT;
    nodeLabelText.anchor.set(0.5);
    nodeGfx.addChild(nodeLabelText);
  }
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

  // label
  if (nodeStyle.label.show) {
    let nodeOuterSize: number = 0;
    if (nodeStyle.shape === 'circle') {
      nodeOuterSize = nodeStyle.radius + nodeStyle.border.width;
    } else if (nodeStyle.shape === 'rect') {
      nodeOuterSize = nodeStyle.height / 2 + nodeStyle.border.width;
    } else {
      throw new Error("node.shape property error!");
    }

    const nodeLabelTextTextureKey = [
      NODE_LABEL_TEXT,
      nodeStyle.label.content,
      nodeStyle.label.fontFamily,
      nodeStyle.label.fontSize,
      nodeStyle.label.fontWeight,
      nodeStyle.label.color,
      nodeStyle.label.stroke,
      nodeStyle.label.strokeThickness
    ].join(DELIMITER);
    const nodeLabelTextTexture = textureCache.get(nodeLabelTextTextureKey, () => {
      const text = textToPixi(nodeStyle.label.type, nodeStyle.label.content, {
        fontFamily: nodeStyle.label.fontFamily,
        fontSize: nodeStyle.label.fontSize,
        fontWeight: nodeStyle.label.fontWeight,
        color: nodeStyle.label.color,
        stroke: nodeStyle.label.stroke,
        strokeThickness: nodeStyle.label.strokeThickness
      });
      return text;
    });

    // nodeGfx -> nodeLabelText
    const nodeLabelText = nodeGfx.getChildByName!(NODE_LABEL_TEXT) as Sprite;
    nodeLabelText.texture = nodeLabelTextTexture;
    const position = nodeStyle.label.position;
    let positionY = 0;
    switch (position) {
      case 'top':
        positionY = -(nodeOuterSize + (nodeLabelTextTexture.height + nodeStyle.label.padding * 2) / 2);
        break;
      case 'center':
        positionY = 0;
        break;
      case 'bottom':
        positionY = nodeOuterSize + (nodeLabelTextTexture.height + nodeStyle.label.padding * 2) / 2;
        break;
      default:
        positionY = nodeOuterSize + (nodeLabelTextTexture.height + nodeStyle.label.padding * 2) / 2;
    }
    nodeLabelText.y = positionY;

    // nodeGfx -> nodeLabelBackground
    const nodeLabelBackground = nodeGfx.getChildByName!(NODE_LABEL_BACKGROUND) as Sprite;
    nodeLabelBackground.y = positionY;
    nodeLabelBackground.width = nodeLabelTextTexture.width + nodeStyle.label.padding * 2;
    nodeLabelBackground.height = nodeLabelTextTexture.height + nodeStyle.label.padding * 2;
    [nodeLabelBackground.tint, nodeLabelBackground.alpha] = colorToPixi(nodeStyle.label.backgroundColor);
  }
}

export function updateNodeVisibility(nodeGfx: Container, zoomStep: number) {
  // nodeGfx -> nodeCircleBorder
  const nodeCircleBorder = nodeGfx.getChildByName!(NODE_CIRCLE_BORDER) as Sprite;
  nodeCircleBorder.renderable = nodeCircleBorder.renderable && zoomStep >= 1;
}