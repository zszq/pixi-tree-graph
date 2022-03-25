import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';
import { Texture } from '@pixi/core';
import { BitmapText } from '@pixi/text-bitmap';
import '@pixi/mixin-get-child-by-name';
import { colorToPixi } from '../utils/color';
import { NodeStyle } from '../utils/style';
import { textToPixi } from '../utils/text';
import { TextureCache } from '../texture-cache';

const DELIMITER = '::';

const NODE_LABEL_BACKGROUND = 'NODE_LABEL_BACKGROUND';
const NODE_LABEL_TEXT = 'NODE_LABEL_TEXT';

export function createNodeLabel(nodeLabelGfx: Container) {
  // nodeLabelGfx -> nodeLabelBackground
  const nodeLabelBackground = new Sprite(Texture.WHITE);
  nodeLabelBackground.name = NODE_LABEL_BACKGROUND;
  nodeLabelBackground.anchor.set(0.5);
  nodeLabelGfx.addChild(nodeLabelBackground);

  // nodeLabelGfx -> nodeLabelText
  const nodeLabelText = new Sprite();
  nodeLabelText.name = NODE_LABEL_TEXT;
  nodeLabelText.anchor.set(0.5);
  nodeLabelGfx.addChild(nodeLabelText);
}

export function updateNodeLabelStyle(nodeLabelGfx: Container, nodeStyle: NodeStyle, textureCache: TextureCache) {
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
  
  // nodeLabelGfx -> nodeLabelText
  const nodeLabelText = nodeLabelGfx.getChildByName!(NODE_LABEL_TEXT) as Sprite;
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

  // nodeLabelGfx -> nodeLabelBackground
  const nodeLabelBackground = nodeLabelGfx.getChildByName!(NODE_LABEL_BACKGROUND) as Sprite;
  nodeLabelBackground.y = positionY;
  nodeLabelBackground.width = nodeLabelTextTexture.width + nodeStyle.label.padding * 2;
  nodeLabelBackground.height = nodeLabelTextTexture.height + nodeStyle.label.padding * 2;
  [nodeLabelBackground.tint, nodeLabelBackground.alpha] = colorToPixi(nodeStyle.label.backgroundColor);

}

export function updateNodeLabelVisibility(nodeLabelGfx: Container, zoomStep: number) {
  // nodeLabelGfx -> nodeLabelBackground
  const nodeLabelBackground = nodeLabelGfx.getChildByName!(NODE_LABEL_BACKGROUND) as Sprite;
  nodeLabelBackground.renderable = nodeLabelBackground.renderable && zoomStep >= 3;

  // nodeLabelGfx -> nodeLabelText
  const nodeLabelText = nodeLabelGfx.getChildByName!(NODE_LABEL_TEXT) as BitmapText;
  nodeLabelText.renderable = nodeLabelText.renderable && zoomStep >= 2;
}