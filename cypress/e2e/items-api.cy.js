/**
 * Tests E2E pour l'API Items / Items API 端到端测试
 * Teste toutes les opérations CRUD sur les items / 测试项目的所有CRUD操作
 */
describe('Tests de l\'API Items / Items API Tests', () => {
  const BASE_URL = 'http://localhost:3000/items';
  let createdItemId;

  beforeEach(() => {
    // Avant chaque test, s'assurer que le serveur fonctionne / 每个测试前确保服务器运行正常
    cy.log('Vérification que le serveur fonctionne sur le port 3000 / 确认服务器在3000端口运行');
  });
  
  // 获取所有项目
  describe('GET /items - Récupérer tous les items', () => {
    it('Devrait retourner tous les items avec le statut 200 / 应该返回所有items和200状态码', () => {
      cy.request('GET', BASE_URL)
        .then((response) => {
          cy.log('Récupération de tous les items réussie / 成功获取所有项目列表');
          expect(response.status).to.eq(200);
          expect(response.body).to.be.an('array');
          expect(response.body.length).to.be.greaterThan(0);
          
          // Vérifier que chaque item a les propriétés correctes / 验证每个item都有正确的属性
          response.body.forEach(item => {
            expect(item).to.have.property('id');
            expect(item).to.have.property('name');
            expect(item).to.have.property('description');
            expect(item).to.have.property('price');
          });
          cy.log('Tous les items ont les propriétés requises / 所有项目都包含必需属性');
        });
    });
  });
  
  // 根据ID获取特定项目
  describe('GET /items/:id - Récupérer un item spécifique par ID ', () => {
    it('Devrait retourner un item existant avec le statut 200 / 应该返回存在的item和200状态码', () => {
      // D'abord récupérer un ID d\'item existant / 首先获取一个存在的item ID
      cy.request('GET', BASE_URL)
        .then((response) => {
          const firstItemId = response.body[0].id;
          cy.log(`Recherche de l'item avec ID: ${firstItemId} / 查找ID为 ${firstItemId} 的项目`);
          
          cy.request('GET', `${BASE_URL}/${firstItemId}`)
            .then((response) => {
              cy.log('Item trouvé avec succès / 成功找到项目');
              expect(response.status).to.eq(200);
              expect(response.body).to.have.property('id', firstItemId);
              expect(response.body).to.have.property('name');
              expect(response.body).to.have.property('description');
              expect(response.body).to.have.property('price');
            });
        });
    });

    // 应该对不存在的ID返回404状态码
    it('Devrait retourner 404 pour un ID non existant', () => {
      const nonExistentId = 'non-existent-id';
      cy.log(`Tentative de récupération d'un item non existant: ${nonExistentId} / 尝试获取不存在的项目: ${nonExistentId}`);
      
      cy.request({
        method: 'GET',
        url: `${BASE_URL}/${nonExistentId}`,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Item non trouvé comme prévu / 项目未找到（符合预期）');
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Item non trouvé ');
      });
    });
  });

  // 创建新项目
  describe('POST /items/createItems - Créer un nouvel item', () => {
    it('Devrait créer un nouvel item avec succès et retourner 201 / 应该成功创建新item并返回201状态码', () => {
      const newItem = {
        name: 'Item Test Cypress',
        description: 'Item créé par Cypress pour les tests',
        price: 9.99
      };

      cy.log(`Création d'un nouvel item: ${newItem.name} / 创建新项目: ${newItem.name}`);
      
      cy.request('POST', `${BASE_URL}/createItems`, newItem)
        .then((response) => {
          cy.log('Item créé avec succès / 项目创建成功');
          expect(response.status).to.eq(201);
          expect(response.body).to.have.property('message', 'Item créé avec succès / 成功创建项目');
          expect(response.body.createdItem).to.have.property('id');
          expect(response.body.createdItem).to.have.property('name', newItem.name);
          expect(response.body.createdItem).to.have.property('description', newItem.description);
          expect(response.body.createdItem).to.have.property('price', newItem.price);
          
          // Sauvegarder l'ID de l'item créé pour les tests suivants / 保存创建的item ID供后续测试使用
          createdItemId = response.body.createdItem.id;
          cy.log(`ID de l'item créé: ${createdItemId} / 创建的项目ID: ${createdItemId}`);
        });
    });

    // 应该验证新item确实被添加到列表中
    it('Devrait vérifier que le nouvel item est bien ajouté à la liste', () => {
      const newItem = {
        name: 'Item de Vérification',
        description: 'Pour vérifier la création dans la liste',
        price: 5.50
      };

      cy.log(`Création et vérification de l'item: ${newItem.name} / 创建并验证项目: ${newItem.name}`);
      
      cy.request('POST', `${BASE_URL}/createItems`, newItem)
        .then((postResponse) => {
          const itemId = postResponse.body.createdItem.id;
          cy.log(`Vérification de l'item créé avec ID: ${itemId} / 验证创建的项目ID: ${itemId}`);
          
          // Vérifier que le nouvel item peut être récupéré via GET / 验证新item可以通过GET获取
          cy.request('GET', `${BASE_URL}/${itemId}`)
            .then((getResponse) => {
              cy.log('Vérification réussie - Item présent dans la liste / 验证成功 - 项目已在列表中');
              expect(getResponse.status).to.eq(200);
              expect(getResponse.body.name).to.eq(newItem.name);
            });
        });
    });
  });

  // 更新项目
  describe('PUT /items/:id - Mettre à jour un item', () => {
    it('Devrait mettre à jour un item existant avec succès / 应该成功更新存在的item', () => {
      // D'abord créer un item pour le test de mise à jour / 首先创建一个item用于更新测试
      const originalItem = {
        name: 'Item Original',
        description: 'Description originale avant mise à jour',
        price: 10.0
      };

      cy.log(`Création d'un item pour test de mise à jour / 创建用于更新测试的项目`);
      
      cy.request('POST', `${BASE_URL}/createItems`, originalItem)
        .then((response) => {
          const itemId = response.body.createdItem.id;
          const updatedItem = {
            name: 'Item Mis à Jour',
            description: 'Description mise à jour par Cypress',
            price: 15.0
          };

          cy.log(`Mise à jour de l'item ${itemId} / 更新项目 ${itemId}`);
          
          cy.request('PUT', `${BASE_URL}/${itemId}`, updatedItem)
            .then((putResponse) => {
              cy.log('✅ Mise à jour réussie / 更新成功');
              expect(putResponse.status).to.eq(200);
              expect(putResponse.body).to.have.property('message', 'Item mis à jour ');
              expect(putResponse.body.updatedItem).to.have.property('name', updatedItem.name);
              expect(putResponse.body.updatedItem).to.have.property('description', updatedItem.description);
              expect(putResponse.body.updatedItem).to.have.property('price', updatedItem.price);
            });
        });
    });

    // 应该对不存在的ID返回404状态码
    it('Devrait retourner 404 pour un ID non existant lors de la mise à jour', () => {
      const nonExistentId = 'non-existent-id';
      const updateData = {
        name: 'Test Mise à Jour',
        description: 'Test de mise à jour sur item non existant',
        price: 1.0
      };

      cy.log(`Tentative de mise à jour d'un item non existant: ${nonExistentId} / 尝试更新不存在的项目: ${nonExistentId}`);
      
      cy.request({
        method: 'PUT',
        url: `${BASE_URL}/${nonExistentId}`,
        body: updateData,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Comportement attendu - Item non trouvé pour mise à jour / 符合预期 - 更新时项目未找到');
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Item non trouvé');
      });
    });
  });

  // 删除项目
  describe('DELETE /items/:id - Supprimer un item', () => {
    it('Devrait supprimer un item existant avec succès / 应该成功删除存在的item', () => {
      // D'abord créer un item pour le test de suppression / 首先创建一个item用于删除测试
      const itemToDelete = {
        name: 'Item à Supprimer',
        description: 'Cet item sera supprimé par le test Cypress',
        price: 7.5
      };

      cy.log(`Création d'un item pour test de suppression / 创建用于删除测试的项目`);
      
      cy.request('POST', `${BASE_URL}/createItems`, itemToDelete)
        .then((response) => {
          const itemId = response.body.createdItem.id;

          cy.log(`Suppression de l'item ${itemId} / 删除项目 ${itemId}`);
          
          cy.request('DELETE', `${BASE_URL}/${itemId}`)
            .then((deleteResponse) => {
              cy.log('Suppression réussie / 删除成功');
              expect(deleteResponse.status).to.eq(204);
              
              // Vérifier que l'item est bien supprimé / 验证item确实被删除
              cy.log(`Vérification que l'item ${itemId} est bien supprimé / 验证项目 ${itemId} 已被删除`);
              cy.request({
                method: 'GET',
                url: `${BASE_URL}/${itemId}`,
                failOnStatusCode: false
              }).then((getResponse) => {
                cy.log('Confirmation - Item supprimé avec succès / 确认 - 项目成功删除');
                expect(getResponse.status).to.eq(404);
              });
            });
        });
    });

    // 应该对不存在的ID返回404状态码
    it('Devrait retourner 404 pour un ID non existant lors de la suppression', () => {
      const nonExistentId = 'non-existent-id';

      cy.log(`Tentative de suppression d'un item non existant: ${nonExistentId} / 尝试删除不存在的项目: ${nonExistentId}`);
      
      cy.request({
        method: 'DELETE',
        url: `${BASE_URL}/${nonExistentId}`,
        failOnStatusCode: false
      }).then((response) => {
        cy.log('Comportement attendu - Item non trouvé pour suppression / 符合预期 - 删除时项目未找到');
        expect(response.status).to.eq(404);
        expect(response.body).to.have.property('message', 'Item non trouvé / 未找到该项目');
      });
    });
  });

  describe('Test d\'intégrité des données / 测试数据完整性', () => {
    it('Devrait vérifier le flux complet CRUD / 应该验证创建、读取、更新、删除的完整流程', () => {
      const testItem = {
        name: 'Item Test CRUD Complet',
        description: 'Item pour test complet du flux CRUD',
        price: 12.5
      };

      let itemId;

      cy.log('🚀 Début du test complet CRUD / 开始完整CRUD流程测试');
      
      // Création / 创建
      cy.request('POST', `${BASE_URL}/createItems`, testItem)
        .then((createResponse) => {
          cy.log('✅ Étape 1 - Création réussie / 步骤1 - 创建成功');
          expect(createResponse.status).to.eq(201);
          itemId = createResponse.body.createdItem.id;

          // Lecture / 读取
          cy.log(`📖 Étape 2 - Lecture de l'item créé / 步骤2 - 读取创建的项目`);
          return cy.request('GET', `${BASE_URL}/${itemId}`);
        })
        .then((readResponse) => {
          cy.log('✅ Étape 2 - Lecture réussie / 步骤2 - 读取成功');
          expect(readResponse.status).to.eq(200);
          expect(readResponse.body.name).to.eq(testItem.name);

          // Mise à jour / 更新
          const updatedData = {
            name: 'Item CRUD Mis à Jour',
            description: 'Description mise à jour après test de lecture',
            price: 18.0
          };
          cy.log(`✏️ Étape 3 - Mise à jour de l'item / 步骤3 - 更新项目`);
          return cy.request('PUT', `${BASE_URL}/${itemId}`, updatedData);
        })
        .then((updateResponse) => {
          cy.log('✅ Étape 3 - Mise à jour réussie / 步骤3 - 更新成功');
          expect(updateResponse.status).to.eq(200);

          // Vérification de la mise à jour / 验证更新
          cy.log(`🔍 Étape 4 - Vérification de la mise à jour / 步骤4 - 验证更新`);
          return cy.request('GET', `${BASE_URL}/${itemId}`);
        })
        .then((verifyResponse) => {
          cy.log('✅ Étape 4 - Vérification réussie / 步骤4 - 验证成功');
          expect(verifyResponse.body.name).to.eq('Item CRUD Mis à Jour');

          // Suppression / 删除
          cy.log(`🗑️ Étape 5 - Suppression de l'item / 步骤5 - 删除项目`);
          return cy.request('DELETE', `${BASE_URL}/${itemId}`);
        })
        .then((deleteResponse) => {
          cy.log('✅ Étape 5 - Suppression réussie / 步骤5 - 删除成功');
          expect(deleteResponse.status).to.eq(204);

          // Vérification de la suppression / 验证删除
          cy.log(`🔍 Étape 6 - Vérification finale de la suppression / 步骤6 - 最终验证删除`);
          return cy.request({
            method: 'GET',
            url: `${BASE_URL}/${itemId}`,
            failOnStatusCode: false
          });
        })
        .then((finalResponse) => {
          cy.log('🎉 Test CRUD complet réussi ! / 完整CRUD测试成功！');
          expect(finalResponse.status).to.eq(404);
        });
    });
  });
});