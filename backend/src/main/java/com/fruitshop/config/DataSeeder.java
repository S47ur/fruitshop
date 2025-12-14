package com.fruitshop.config;

import com.fruitshop.entity.*;
import com.fruitshop.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * 数据初始化器 - 在所有环境运行
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    
    private final StoreRepository storeRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final PartnerRepository partnerRepository;
    private final InventoryRepository inventoryRepository;
    private final MemberRepository memberRepository;
    private final SystemParameterRepository parameterRepository;
    private final RoleMatrixRepository roleMatrixRepository;
    private final ApprovalFlowRepository approvalFlowRepository;
    private final IntegrationRepository integrationRepository;
    private final AutomationRepository automationRepository;
    private final ChannelConfigRepository channelConfigRepository;
    private final AgingBucketRepository agingBucketRepository;
    
    @Override
    public void run(String... args) {
        log.info("开始初始化种子数据...");
        
        initStores();
        initUsers();
        initProducts();
        initPartners();
        initInventory();
        initMembers();
        initSystemParameters();
        initRoleMatrix();
        initApprovalFlows();
        initIntegrations();
        initAutomations();
        initChannelConfigs();
        initAgingBuckets();
        
        log.info("种子数据初始化完成！");
    }
    
    private void initStores() {
        if (storeRepository.count() > 0) return;
        
        storeRepository.saveAll(Arrays.asList(
            createStore("store-1", "旗舰店", "南京市中心", "13800000001"),
            createStore("store-2", "分店A", "南京江宁区", "13800000002"),
            createStore("store-3", "分店B", "南京鼓楼区", "13800000003")
        ));
    }
    
    private Store createStore(String id, String name, String address, String phone) {
        Store store = new Store();
        store.setId(id);
        store.setName(name);
        store.setAddress(address);
        store.setPhone(phone);
        return store;
    }
    
    private void initUsers() {
        if (userRepository.count() > 0) return;
        
        User owner = new User();
        owner.setUsername("admin");
        owner.setPassword("admin123");
        owner.setName("管理员");
        owner.setRole(User.UserRole.ROLE_OWNER);
        owner.setEmail("admin@fruitshop.com");
        owner.setStoreIds(Arrays.asList("store-1", "store-2", "store-3"));
        userRepository.save(owner);
        
        User manager = new User();
        manager.setUsername("manager");
        manager.setPassword("manager123");
        manager.setName("店长张三");
        manager.setRole(User.UserRole.ROLE_MANAGER);
        manager.setEmail("manager@fruitshop.com");
        manager.setStoreIds(Collections.singletonList("store-1"));
        userRepository.save(manager);
        
        User cashier = new User();
        cashier.setUsername("cashier");
        cashier.setPassword("cashier123");
        cashier.setName("收银员小李");
        cashier.setRole(User.UserRole.ROLE_CASHIER);
        cashier.setEmail("cashier@fruitshop.com");
        cashier.setStoreIds(Collections.singletonList("store-1"));
        userRepository.save(cashier);
    }
    
    private void initProducts() {
        if (productRepository.count() > 0) return;
        
        productRepository.saveAll(Arrays.asList(
            createProduct("apple", "苹果", "fruits", "进口红富士苹果"),
            createProduct("banana", "香蕉", "fruits", "海南香蕉"),
            createProduct("orange", "橙子", "fruits", "赣南脐橙"),
            createProduct("grape", "葡萄", "fruits", "新疆无籽葡萄"),
            createProduct("watermelon", "西瓜", "fruits", "麒麟西瓜"),
            createProduct("mango", "芒果", "fruits", "海南芒果"),
            createProduct("pear", "梨", "fruits", "砀山梨"),
            createProduct("peach", "桃子", "fruits", "水蜜桃")
        ));
    }
    
    private Product createProduct(String id, String name, String category, String desc) {
        Product product = new Product();
        product.setId(id);
        product.setName(name);
        product.setCategory(category);
        product.setDescription(desc);
        product.setStatus("active");
        return product;
    }
    
    private void initPartners() {
        if (partnerRepository.count() > 0) return;
        
        partnerRepository.saveAll(Arrays.asList(
            createPartner("sup-1", "华东水果批发", Partner.PartnerType.SUPPLIER, "李经理", "13911111111"),
            createPartner("sup-2", "南方水果贸易", Partner.PartnerType.SUPPLIER, "王老板", "13922222222"),
            createPartner("cus-1", "大型超市A", Partner.PartnerType.CUSTOMER, "张采购", "13933333333"),
            createPartner("cus-2", "连锁便利店B", Partner.PartnerType.CUSTOMER, "刘店长", "13944444444")
        ));
    }
    
    private Partner createPartner(String id, String name, Partner.PartnerType type, String contact, String phone) {
        Partner partner = new Partner();
        partner.setId(id);
        partner.setName(name);
        partner.setType(type);
        partner.setContactName(contact);
        partner.setPhone(phone);
        partner.setEmail(contact.toLowerCase() + "@example.com");
        partner.setPaymentTermDays(30);
        partner.setStatus("active");
        return partner;
    }
    
    private void initInventory() {
        if (inventoryRepository.count() > 0) return;
        
        String storeId = "store-1";
        inventoryRepository.saveAll(Arrays.asList(
            createInventory("inv-" + storeId + "-apple", storeId, "apple", "苹果", 150, 6.0, 10.0, 80),
            createInventory("inv-" + storeId + "-banana", storeId, "banana", "香蕉", 200, 3.5, 6.0, 100),
            createInventory("inv-" + storeId + "-orange", storeId, "orange", "橙子", 180, 5.0, 8.0, 80),
            createInventory("inv-" + storeId + "-grape", storeId, "grape", "葡萄", 100, 12.0, 20.0, 50),
            createInventory("inv-" + storeId + "-watermelon", storeId, "watermelon", "西瓜", 300, 2.5, 5.0, 150),
            createInventory("inv-" + storeId + "-mango", storeId, "mango", "芒果", 80, 15.0, 25.0, 40),
            createInventory("inv-" + storeId + "-pear", storeId, "pear", "梨", 120, 4.0, 7.0, 60),
            createInventory("inv-" + storeId + "-peach", storeId, "peach", "桃子", 90, 8.0, 13.0, 50)
        ));
    }
    
    private Inventory createInventory(String id, String storeId, String productId, String fruit, 
                                       double qty, double cost, double price, double reorder) {
        Inventory inv = new Inventory();
        inv.setId(id);
        inv.setStoreId(storeId);
        inv.setProductId(productId);
        inv.setFruit(fruit);
        inv.setOnHandKg(BigDecimal.valueOf(qty));
        inv.setUnitCost(BigDecimal.valueOf(cost));
        inv.setUnitPrice(BigDecimal.valueOf(price));
        inv.setReorderLevelKg(BigDecimal.valueOf(reorder));
        return inv;
    }
    
    private void initMembers() {
        if (memberRepository.count() > 0) return;
        
        memberRepository.saveAll(Arrays.asList(
            createMember("member-1", "王先生", "13866666666", 1500.0),
            createMember("member-2", "李女士", "13877777777", 2300.0),
            createMember("member-3", "张老板", "13888888888", 5600.0)
        ));
    }
    
    private Member createMember(String id, String name, String phone, double points) {
        Member member = new Member();
        member.setId(id);
        member.setName(name);
        member.setPhone(phone);
        member.setPoints(BigDecimal.valueOf(points));
        member.setTier("黄金会员");
        member.setJoinDate(LocalDate.now().minusMonths(6));
        return member;
    }
    
    private void initSystemParameters() {
        if (parameterRepository.count() > 0) return;
        
        parameterRepository.saveAll(Arrays.asList(
            createParameter("TAX_RATE", "税率", "0.06", "默认税率6%"),
            createParameter("POINTS_RATE", "积分比例", "0.01", "消费1元积1分"),
            createParameter("LOW_STOCK_ALERT", "低库存预警", "50", "库存低于此值预警"),
            createParameter("DEFAULT_PAYMENT_TERM", "默认账期", "30", "默认账期天数")
        ));
    }
    
    private SystemParameter createParameter(String key, String label, String value, String desc) {
        SystemParameter param = new SystemParameter();
        param.setParamKey(key);
        param.setLabel(label);
        param.setParamValue(value);
        param.setDescription(desc);
        return param;
    }
    
    private void initRoleMatrix() {
        if (roleMatrixRepository.count() > 0) return;
        
        roleMatrixRepository.saveAll(Arrays.asList(
            createRole(User.UserRole.ROLE_OWNER, "店主", Arrays.asList(
                "dashboard", "procurement", "sales", "inventory", "finance", "master", "system")),
            createRole(User.UserRole.ROLE_MANAGER, "店长", Arrays.asList(
                "dashboard", "procurement", "sales", "inventory", "finance")),
            createRole(User.UserRole.ROLE_CASHIER, "收银员", Arrays.asList(
                "dashboard", "sales"))
        ));
    }
    
    private RoleMatrix createRole(User.UserRole role, String label, List<String> permissions) {
        RoleMatrix matrix = new RoleMatrix();
        matrix.setRole(role);
        matrix.setLabel(label);
        matrix.setPermissions(permissions);
        return matrix;
    }
    
    private void initApprovalFlows() {
        if (approvalFlowRepository.count() > 0) return;
        
        ApprovalFlow flow = new ApprovalFlow();
        flow.setId("flow-purchase");
        flow.setName("采购审批流程");
        flow.setTrigger("采购金额超过5000元");
        flow.setEnabled(true);
        
        ApprovalStep step1 = new ApprovalStep();
        step1.setOrder(1);
        step1.setApprover(User.UserRole.ROLE_MANAGER);
        step1.setThreshold(new BigDecimal("5000"));
        
        ApprovalStep step2 = new ApprovalStep();
        step2.setOrder(2);
        step2.setApprover(User.UserRole.ROLE_OWNER);
        step2.setThreshold(new BigDecimal("10000"));
        
        flow.setSteps(Arrays.asList(step1, step2));
        
        approvalFlowRepository.save(flow);
    }
    
    private void initIntegrations() {
        if (integrationRepository.count() > 0) return;
        
        integrationRepository.saveAll(Arrays.asList(
            createIntegration("wechat-pay", "微信支付", "payment", true, LocalDateTime.now()),
            createIntegration("alipay", "支付宝", "payment", true, LocalDateTime.now()),
            createIntegration("sms", "短信服务", "notification", false, null)
        ));
    }
    
    private Integration createIntegration(String id, String name, String type, boolean connected, LocalDateTime lastSync) {
        Integration integration = new Integration();
        integration.setId(id);
        integration.setName(name);
        integration.setType(type);
        integration.setConnected(connected);
        integration.setLastSync(lastSync);
        return integration;
    }
    
    private void initAutomations() {
        if (automationRepository.count() > 0) return;
        
        automationRepository.saveAll(Arrays.asList(
            createAutomation("auto-reorder", "自动补货", "库存低于预警线时自动创建采购单", true, 15),
            createAutomation("auto-reminder", "付款提醒", "账期到期前3天自动发送提醒", true, 8),
            createAutomation("auto-report", "日报生成", "每日自动生成销售日报", false, 0)
        ));
    }
    
    private Automation createAutomation(String id, String name, String desc, boolean enabled, int executions) {
        Automation auto = new Automation();
        auto.setId(id);
        auto.setName(name);
        auto.setDescription(desc);
        auto.setEnabled(enabled);
        auto.setLastExecutionCount(executions);
        return auto;
    }
    
    private void initChannelConfigs() {
        if (channelConfigRepository.count() > 0) return;
        
        channelConfigRepository.saveAll(Arrays.asList(
            createChannelConfig("channel-pos", "门店POS", true, new BigDecimal("45.5")),
            createChannelConfig("channel-online", "线上商城", true, new BigDecimal("32.8")),
            createChannelConfig("channel-wholesale", "批发渠道", true, new BigDecimal("21.7"))
        ));
    }
    
    private ChannelConfig createChannelConfig(String id, String name, boolean enabled, BigDecimal share) {
        ChannelConfig config = new ChannelConfig();
        config.setId(id);
        config.setName(name);
        config.setEnabled(enabled);
        config.setRevenueShare(share);
        return config;
    }
    
    private void initAgingBuckets() {
        if (agingBucketRepository.count() > 0) return;
        
        agingBucketRepository.saveAll(Arrays.asList(
            createAgingBucket("aging-current", "当期", 0, 30, new BigDecimal("125000")),
            createAgingBucket("aging-30", "31-60天", 31, 60, new BigDecimal("45000")),
            createAgingBucket("aging-60", "61-90天", 61, 90, new BigDecimal("18000")),
            createAgingBucket("aging-90", "90天以上", 91, 999, new BigDecimal("7500"))
        ));
    }
    
    private AgingBucket createAgingBucket(String id, String label, int min, int max, BigDecimal amount) {
        AgingBucket bucket = new AgingBucket();
        bucket.setId(id);
        bucket.setLabel(label);
        bucket.setMinDays(min);
        bucket.setMaxDays(max);
        bucket.setAmount(amount);
        return bucket;
    }
}
