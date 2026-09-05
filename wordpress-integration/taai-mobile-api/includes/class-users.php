<?php
defined('ABSPATH') || exit;
final class TAAI_Mobile_Users {
    public static function profile(int $id): array { $u=get_userdata($id); return ['id'=>$id,'username'=>$u->user_login,'email'=>$u->user_email,'firstName'=>$u->first_name,'lastName'=>$u->last_name,'displayName'=>$u->display_name,'phone'=>get_user_meta($id,'billing_phone',true),'billing'=>['address1'=>get_user_meta($id,'billing_address_1',true),'city'=>get_user_meta($id,'billing_city',true),'postcode'=>get_user_meta($id,'billing_postcode',true),'state'=>get_user_meta($id,'billing_state',true),'country'=>get_user_meta($id,'billing_country',true)]]; }
    public static function me() { return self::profile(TAAI_Mobile_Security::user_id()); }
    public static function update(WP_REST_Request $r) { $id=TAAI_Mobile_Security::user_id();$data=['ID'=>$id];foreach(['firstName'=>'first_name','lastName'=>'last_name','email'=>'user_email'] as $in=>$out)if($r->has_param($in))$data[$out]=$in==='email'?sanitize_email($r[$in]):sanitize_text_field($r[$in]);$result=wp_update_user($data);if(is_wp_error($result))return $result;$map=['phone'=>'billing_phone','address1'=>'billing_address_1','city'=>'billing_city','postcode'=>'billing_postcode','state'=>'billing_state','country'=>'billing_country'];foreach($map as $in=>$meta)if($r->has_param($in))update_user_meta($id,$meta,sanitize_text_field($r[$in]));return self::profile($id); }
}

